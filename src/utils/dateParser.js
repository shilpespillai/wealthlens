/**
 * Robust Polymorphic Date Parser
 * Extracts Year and Month from various date formats (ISO, Regional, Timestamp)
 * without regional ambiguity (DD/MM vs MM/DD).
 */
export const getYearMonth = (rawDate, targetMonth = null) => {
  if (!rawDate) return { year: null, month: null };
  
  let txYear = null;
  let txMonth = null;
  
  // Case 1: Numeric Timestamp
  if (typeof rawDate === 'number' || (!isNaN(rawDate) && !isNaN(parseFloat(rawDate)) && !String(rawDate).includes('-') && !String(rawDate).includes('/'))) {
    const d = new Date(Number(rawDate));
    txYear = d.getFullYear();
    txMonth = d.getMonth() + 1; // 1-12
  } 
  // Case 2: String parsing
  else {
    const dateStr = String(rawDate);
    const parts = dateStr.split(/[^0-9]/).filter(p => p.length > 0);
    
    if (parts.length >= 3) {
      if (parts[0].length === 4) { // ISO YYYY-MM-DD
        txYear = parseInt(parts[0]);
        txMonth = parseInt(parts[1]);
      } else if (parts[2].length === 4) { // DD/MM/YYYY (Standard for this user)
        txYear = parseInt(parts[2]);
        const p0 = parseInt(parts[0]);
        const p1 = parseInt(parts[1]);
        
        // LOCK: In DD/MM/YYYY, the second part (p1) is ALWAYS the month.
        // We no longer use 'targetMonth' to guess, as it causes leaks across months.
        txMonth = p1;
      }
    }
    
    // Fallback: Native parsing
    if (!txYear || !txMonth) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        txYear = d.getFullYear();
        txMonth = d.getMonth() + 1;
      }
    }
  }
  
  return { year: txYear, month: txMonth };
};

export const robustParseDate = (rawDate) => {
  if (!rawDate) return null;
  
  // Try custom parts-based parsing first (DD/MM/YYYY vs YYYY-MM-DD)
  const dateStr = String(rawDate);
  const parts = dateStr.split(/[^0-9]/).filter(p => p.length > 0);
  
  if (parts.length >= 3) {
    if (parts[0].length === 4) { // ISO YYYY-MM-DD
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else if (parts[2].length === 4) { // DD/MM/YYYY
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
  }

  // Fallback to native parsing for timestamps or other formats
  const d = new Date(rawDate);
  return isNaN(d.getTime()) ? null : d;
};

export const isSameMonthYear = (rawDate, targetMonth, targetYear) => {
  const d = robustParseDate(rawDate);
  if (!d) return false;
  return d.getFullYear() === Number(targetYear) && (d.getMonth() + 1) === Number(targetMonth);
};
