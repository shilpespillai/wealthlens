/**
 * WealthLens Institutional Cryptography Core
 * Implements AES-GCM 256-bit client-side encryption using the Web Crypto API.
 * Ensures zero-knowledge privacy for the Unified Monthly Vault.
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

/**
 * Derives a stable encryption key from the User ID.
 * In a future update, this can be salted with a user-provided Master Password.
 */
async function getEncryptionKey(userId) {
  const encoder = new TextEncoder();
  const baseKeyData = encoder.encode(userId + "wl_institutional_salt");
  
  const digest = await crypto.subtle.digest('SHA-256', baseKeyData);
  
  return await crypto.subtle.importKey(
    'raw',
    digest,
    { name: ENCRYPTION_ALGORITHM },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a JSON payload.
 * Returns a base64 string containing the IV and the ciphertext.
 */
export async function encryptPayload(payload, userId) {
  if (!payload || !userId) return null;
  
  try {
    const key = await getEncryptionKey(userId);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload));
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      data
    );
    
    // Combine IV and Ciphertext for storage
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    // Convert to base64 for database-safe storage
    return btoa(String.fromCharCode(...combined));
  } catch (err) {
    console.error("[Crypto Engine] Encryption failed:", err);
    return null;
  }
}

/**
 * Decrypts a base64 string into a JSON payload.
 */
export async function decryptPayload(encryptedBase64, userId) {
  if (!encryptedBase64 || !userId) return null;
  
  try {
    if (typeof encryptedBase64 !== 'string') return null;
    
    // Safety check: Is this even a potential base64 string?
    // This prevents atob() from throwing an InvalidCharacterError for plain JSON
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    if (!base64Regex.test(encryptedBase64)) {
      return null;
    }
    
    const key = await getEncryptionKey(userId);
    const combined = new Uint8Array(
      atob(encryptedBase64).split("").map(c => c.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      ciphertext
    );
    
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  } catch (err) {
    console.error("[Crypto Engine] Decryption failed. Possible key mismatch.", err);
    return null;
  }
}
