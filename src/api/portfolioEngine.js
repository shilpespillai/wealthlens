/**
 * Portfolio Intelligence Engine
 * Standardizes calculation logic across the platform.
 */

/**
 * Calculates the latest state of the portfolio by identifying the most recent 
 * snapshot for every unique asset label.
 * 
 * @param {Array} rows - Raw portfolio_holdings from the database
 * @param {Date} endDate - Optional cutoff date for historical calculations
 * @returns {Array} - The latest unique holdings
 */
export const calculatePortfolioHoldings = (rows = [], endDate = new Date()) => {
  if (!rows || rows.length === 0) return [];

  const timeCutoff = endDate.getTime();
  const latestByLabel = {};

  // Step 1: Flatten rows if they are using the new JSONB 'holdings' architecture
  const flattenedRows = [];
  rows.forEach(row => {
    if (row.holdings && Array.isArray(row.holdings)) {
      row.holdings.forEach(h => {
        flattenedRows.push({ ...h, snapshot_date: row.snapshot_date, user_id: row.user_id, id: h.id || row.id });
      });
    } else {
      flattenedRows.push(row);
    }
  });

  flattenedRows.forEach(row => {
    const rowDate = new Date(row.snapshot_date).getTime();
    
    // Only consider history up to selected end date
    if (rowDate <= timeCutoff) {
      const labelKey = `${(row.label || row.name || "Unlabeled Asset").trim().toLowerCase()}_${row.id || ''}`;
      
      if (!latestByLabel[labelKey] || rowDate > new Date(latestByLabel[labelKey].snapshot_date).getTime()) {
        latestByLabel[labelKey] = row;
      }
    }
  });

  return Object.values(latestByLabel);
};

/**
 * Generates institutional metrics for a set of holdings.
 */
export const getPortfolioMetrics = (holdings = []) => {
  const totalValue = holdings.reduce((sum, h) => sum + (Number(h.current_value) || 0), 0);
  const totalInvested = holdings.reduce((sum, h) => sum + (Number(h.invested_amount) || 0), 0);
  const totalMortgage = holdings.reduce((sum, h) => sum + (Number(h.mortgage_amount) || 0), 0);
  
  const totalGain = totalValue - totalInvested;
  const netValue = totalValue - totalMortgage;
  const returnPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  // Group by asset class
  const classGroups = {};
  holdings.forEach(h => {
    const cls = h.asset_class || 'other';
    if (!classGroups[cls]) classGroups[cls] = 0;
    classGroups[cls] += (Number(h.current_value) || 0);
  });

  return {
    totalValue,
    totalInvested,
    totalMortgage,
    totalGain,
    netValue,
    returnPct,
    classGroups,
    count: holdings.length
  };
};
