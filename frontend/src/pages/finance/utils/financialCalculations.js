// From ProfessionalFinance.js
export const calculateSATakeHomePay = (grossSalary) => {
  const annual = grossSalary * 12;
  let tax = 0;
  // 2024 tax brackets
  if (annual <= 237100) tax = annual * 0.18;
  else if (annual <= 370500) tax = 42678 + (annual - 237100) * 0.26;
  else if (annual <= 512800) tax = 77362 + (annual - 370500) * 0.31;
  else if (annual <= 673000) tax = 121475 + (annual - 512800) * 0.36;
  else if (annual <= 857900) tax = 179147 + (annual - 673000) * 0.39;
  else if (annual <= 1817000) tax = 251258 + (annual - 857900) * 0.41;
  else tax = 644489 + (annual - 1817000) * 0.45;
  
  const uif = Math.min(grossSalary * 0.01, 177.12);
  const retirement = grossSalary * 0.075;
  const medicalAid = 0; // Placeholder
  
  const monthlyTax = Math.round(tax / 12);
  const takeHomePay = grossSalary - monthlyTax - uif - retirement - medicalAid;
  
  return {
    grossSalary,
    takeHomePay: Math.round(takeHomePay),
    deductions: {
      tax: monthlyTax,
      uif: Math.round(uif),
      retirement: Math.round(retirement),
      medicalAid: Math.round(medicalAid)
    }
  };
};

// From GentleSpendingView.js
export const calculateEmergencyFundTarget = (monthlyExpenses) => ({
  threeMonths: monthlyExpenses * 3,
  sixMonths: monthlyExpenses * 6,
  message: `Aim for R${(monthlyExpenses * 3).toLocaleString()} (3 months) first`
});

export const calculateDecemberSavings = (desiredAmount, currentMonth) => {
  const monthsUntilDecember = currentMonth <= 11 ? 12 - currentMonth : 12;
  const monthlySave = desiredAmount / monthsUntilDecember;
  return {
    monthly: Math.round(monthlySave),
    months: monthsUntilDecember,
    message: `Save R${Math.round(monthlySave).toLocaleString()}/month for December`
  };
};

// From WalletRestingHelper.js
export const calculateGrowth = (monthly, years, rate) => {
  const monthlyRate = rate / 100 / 12;
  const months = years * 12;
  if (monthlyRate === 0) return monthly * months;
  return Math.round(monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));
};

export const calculateRATaxSaving = (grossSalary, raContribution) => {
  let marginalRate = 0.18;
  const annual = grossSalary * 12;
  if (annual > 237100) marginalRate = 0.26;
  if (annual > 370500) marginalRate = 0.31;
  if (annual > 512800) marginalRate = 0.36;
  if (annual > 673000) marginalRate = 0.39;
  if (annual > 857900) marginalRate = 0.41;
  if (annual > 1817000) marginalRate = 0.45;
  const maxDeductible = Math.min(grossSalary * 0.275, 350000 / 12);
  const actualDeductible = Math.min(raContribution, maxDeductible);
  const monthlySaving = Math.round(actualDeductible * marginalRate);
  return { monthlySaving, marginalRate: Math.round(marginalRate * 100), actualDeductible: Math.round(actualDeductible) };
};

// From CommuteShareHelper.js
export const calculateFuelCost = (kmPerDay, fuelConsumption, workDaysPerWeek, fuelPrice) => {
  const kmPerMonth = kmPerDay * workDaysPerWeek * 4.33;
  const litresPerMonth = (kmPerMonth / 100) * fuelConsumption;
  return Math.round(litresPerMonth * fuelPrice);
};

export const calculateCarpoolShare = (fuelCost, people) => {
  return Math.round(fuelCost / people);
};