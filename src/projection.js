export const DEFAULT_ANNUAL_RETURN = 0.1;
export const MILESTONES = [10000, 50000, 100000, 250000, 500000, 1000000, 2000000];

export function monthlyRateFromAnnual(annualReturn) {
  return Math.pow(1 + annualReturn, 1 / 12) - 1;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPercent(value) {
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

export function projectInvestment({
  currentAge,
  targetAge,
  startingAmount,
  monthlyContribution,
  annualReturn,
  startDate = new Date()
}) {
  const safeCurrentAge = Number(currentAge);
  const safeTargetAge = Number(targetAge);
  const safeStartingAmount = Number(startingAmount);
  const safeMonthlyContribution = Number(monthlyContribution);
  const safeAnnualReturn = Number(annualReturn);

  if (!Number.isFinite(safeCurrentAge) || !Number.isFinite(safeTargetAge)) {
    throw new Error("Ages must be valid numbers.");
  }

  if (safeTargetAge <= safeCurrentAge) {
    throw new Error("Target age must be greater than current age.");
  }

  const totalMonths = Math.round((safeTargetAge - safeCurrentAge) * 12);
  const monthlyRate = monthlyRateFromAnnual(safeAnnualReturn);
  const series = [];

  let balance = safeStartingAmount;
  let invested = safeStartingAmount;

  series.push({
    monthIndex: 0,
    age: safeCurrentAge,
    date: new Date(startDate),
    balance,
    invested,
    gain: balance - invested
  });

  for (let monthIndex = 1; monthIndex <= totalMonths; monthIndex += 1) {
    const date = addMonths(startDate, monthIndex);
    balance = (balance + safeMonthlyContribution) * (1 + monthlyRate);
    invested += safeMonthlyContribution;

    series.push({
      monthIndex,
      age: safeCurrentAge + monthIndex / 12,
      date,
      balance,
      invested,
      gain: balance - invested
    });
  }

  const finalPoint = series[series.length - 1];
  const nextMilestone = findNextMilestone(finalPoint.balance);
  const unlockedMilestones = MILESTONES.filter((target) => finalPoint.balance >= target);
  const compoundingShare = finalPoint.balance === 0 ? 0 : finalPoint.gain / finalPoint.balance;

  return {
    totalMonths,
    series,
    finalPoint,
    unlockedMilestones,
    nextMilestone,
    compoundingShare
  };
}

export function findNextMilestone(balance) {
  return MILESTONES.find((target) => balance < target) ?? null;
}

export function nearestMilestoneProgress(balance) {
  const next = findNextMilestone(balance);
  if (!next) {
    return { nextMilestone: null, progress: 1 };
  }

  const previous = [...MILESTONES].reverse().find((target) => target <= balance) ?? 0;
  const span = next - previous;
  const progress = span === 0 ? 1 : (balance - previous) / span;

  return {
    nextMilestone: next,
    progress: clamp(progress, 0, 1)
  };
}

export function describeMilestones(balance) {
  return MILESTONES.map((target) => ({
    target,
    unlocked: balance >= target
  }));
}

export function addMonths(date, count) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + count);
  return next;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
