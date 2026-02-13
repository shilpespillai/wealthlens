export function calculateInvestment(params) {
  const {
    initialAmount,
    monthlyContribution,
    years,
    returnRate,
    inflationRate,
    frequency,
    taxRate,
    fees,
  } = params;

  const monthlyRate = (returnRate - fees) / 100 / 12;
  const monthlyInflation = inflationRate / 100 / 12;
  const totalMonths = years * 12;

  let contributionPerMonth = monthlyContribution;
  if (frequency === "quarterly") contributionPerMonth = monthlyContribution / 3;
  if (frequency === "annually") contributionPerMonth = monthlyContribution / 12;
  // If user entered monthly, keep as is. For quarterly, user enters quarterly amount.
  // Actually let's treat the input as the amount per period:
  if (frequency === "quarterly") contributionPerMonth = monthlyContribution / 3;
  else if (frequency === "annually") contributionPerMonth = monthlyContribution / 12;
  else contributionPerMonth = monthlyContribution;

  const yearlyData = [];
  let balance = initialAmount;
  let totalContributed = initialAmount;
  let totalInterest = 0;

  for (let month = 1; month <= totalMonths; month++) {
    const interest = balance * monthlyRate;
    balance += interest + contributionPerMonth;
    totalContributed += contributionPerMonth;
    totalInterest += interest;

    if (month % 12 === 0) {
      const year = month / 12;
      const inflationFactor = Math.pow(1 + inflationRate / 100, year);
      const realValue = balance / inflationFactor;
      const gains = balance - totalContributed;
      const taxOnGains = gains > 0 ? gains * (taxRate / 100) : 0;
      const afterTax = balance - taxOnGains;

      yearlyData.push({
        year,
        nominalValue: Math.round(balance),
        realValue: Math.round(realValue),
        totalContributed: Math.round(totalContributed),
        totalInterest: Math.round(totalInterest),
        afterTax: Math.round(afterTax),
        gains: Math.round(gains),
        taxPaid: Math.round(taxOnGains),
      });
    }
  }

  const finalGains = balance - totalContributed;
  const finalTax = finalGains > 0 ? finalGains * (taxRate / 100) : 0;
  const inflationFactor = Math.pow(1 + inflationRate / 100, years);

  return {
    yearlyData,
    summary: {
      finalValue: Math.round(balance),
      totalContributed: Math.round(totalContributed),
      totalReturns: Math.round(finalGains),
      afterTax: Math.round(balance - finalTax),
      taxPaid: Math.round(finalTax),
      realValue: Math.round(balance / inflationFactor),
      totalReturnPercent: totalContributed > 0
        ? ((balance - totalContributed) / totalContributed * 100).toFixed(1)
        : 0,
      annualizedReturn: returnRate - fees,
    },
  };
}

export function calculateScenarios(params) {
  const scenarios = {
    conservative: { ...params, returnRate: params.returnRate * 0.6 },
    moderate: { ...params },
    aggressive: { ...params, returnRate: params.returnRate * 1.5 },
  };

  return {
    conservative: calculateInvestment(scenarios.conservative),
    moderate: calculateInvestment(scenarios.moderate),
    aggressive: calculateInvestment(scenarios.aggressive),
  };
}