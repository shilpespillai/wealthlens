/**
 * Independent Email Service
 * Handles communication with the internal support email API route.
 * Resolves dependencies on external platforms like Base44 for critical communication.
 */

export const emailService = {
  /**
   * Sends a support email using the internal API.
   * @param {Object} params
   * @param {string} params.subject - The subject of the email.
   * @param {string} params.message - The content of the message.
   * @param {string} params.userEmail - The sender's email address.
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  sendSupportEmail: async ({ subject, message, userEmail }) => {
    try {
      const response = await fetch('/api/support-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, message, userEmail }),
        cache: 'no-store'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with ${response.status}`);
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('[EmailService] Failed to send support email:', error);
      throw error;
    }
  }
};
