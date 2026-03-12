export const DEFAULT_ANNUAL_RETURN = 0.1;
export const MILESTONES = [10000, 50000, 100000, 250000, 500000, 1000000, 2000000];

const INVESTOR_LEVELS = [
  { minimum: 0, label: "Seed Starter", copy: "You are building the habit that matters most: staying invested." },
  { minimum: 50000, label: "Momentum Builder", copy: "Your portfolio has enough size for compounding to feel real." },
  { minimum: 100000, label: "Six-Figure Climber", copy: "The base is strong now. Time starts doing heavy lifting." },
  { minimum: 250000, label: "Compounding Operator", copy: "Your money is starting to create meaningful money on its own." },
  { minimum: 500000, label: "Half-Million Runner", copy: "The snowball is large enough to change future choices." },
  { minimum: 1000000, label: "Millionaire Track", copy: "You are in the range where patience can outperform hustle." },
  { minimum: 2000000, label: "Freedom Engine", copy: "Compounding has become a serious wealth machine." }
];

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

export function formatDuration(totalMonths) {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) {
    return `${months} months`;
  }

  if (months === 0) {
    return `${years} years`;
  }

  return `${years} years, ${months} months`;
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
  const totalGain = finalPoint.gain;
  const milestoneHits = findMilestoneHits(series);
  const investorLevel = getInvestorLevel(finalPoint.balance);

  return {
    totalMonths,
    series,
    finalPoint,
    unlockedMilestones,
    nextMilestone,
    compoundingShare,
    totalGain,
    totalInvested: finalPoint.invested,
    annualContribution: safeMonthlyContribution * 12,
    milestoneHits,
    investorLevel,
    inputs: {
      currentAge: safeCurrentAge,
      targetAge: safeTargetAge,
      startingAmount: safeStartingAmount,
      monthlyContribution: safeMonthlyContribution,
      annualReturn: safeAnnualReturn
    }
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

export function findMilestoneHits(series, milestones = MILESTONES) {
  return milestones
    .map((target) => {
      const point = series.find((entry) => entry.balance >= target);
      return point
        ? {
            target,
            monthIndex: point.monthIndex,
            date: point.date,
            age: point.age
          }
        : null;
    })
    .filter(Boolean);
}

export function findFirstCrossing(series, predicate) {
  return series.find(predicate) ?? null;
}

export function getInvestorLevel(balance) {
  return (
    [...INVESTOR_LEVELS].reverse().find((level) => balance >= level.minimum) ??
    INVESTOR_LEVELS[0]
  );
}

export function describeAchievements(projection) {
  const { series, finalPoint, totalMonths, annualContribution, inputs } = projection;
  const startingAmount = inputs.startingAmount;
  const snowballPoint = findFirstCrossing(series, (point) => point.gain >= annualContribution);
  const doubledStartPoint =
    startingAmount > 0
      ? findFirstCrossing(series, (point) => point.balance >= startingAmount * 2)
      : null;

  return [
    {
      title: "Habit Builder",
      target: "Stay invested for 10 years",
      unlocked: totalMonths >= 120,
      detail: totalMonths >= 120 ? `${formatDuration(totalMonths)} on the clock.` : `${formatDuration(totalMonths)} projected so far.`
    },
    {
      title: "Snowball Activated",
      target: "Compounding gain beats one year of DCA",
      unlocked: Boolean(snowballPoint),
      detail: snowballPoint
        ? `Reached after ${formatDuration(snowballPoint.monthIndex)}.`
        : "Not reached yet in this plan."
    },
    {
      title: "Double the Day-One Stack",
      target: "Portfolio doubles the starting amount",
      unlocked: Boolean(doubledStartPoint),
      detail: doubledStartPoint
        ? `Unlocked near age ${doubledStartPoint.age.toFixed(1)}.`
        : startingAmount > 0
          ? "Needs more time or contribution power."
          : "Add a starting amount to unlock this badge."
    },
    {
      title: "Six-Figure Club",
      target: "Reach $100,000",
      unlocked: finalPoint.balance >= 100000,
      detail: finalPoint.balance >= 100000 ? "Six figures unlocked." : `${formatCurrency(100000 - finalPoint.balance)} to go.`
    },
    {
      title: "Half-Million Run",
      target: "Reach $500,000",
      unlocked: finalPoint.balance >= 500000,
      detail: finalPoint.balance >= 500000 ? "Half-million checkpoint cleared." : `${formatCurrency(500000 - finalPoint.balance)} to go.`
    },
    {
      title: "Millionaire Track",
      target: "Reach $1,000,000",
      unlocked: finalPoint.balance >= 1000000,
      detail: finalPoint.balance >= 1000000 ? "Seven figures projected." : `${formatCurrency(1000000 - finalPoint.balance)} to go.`
    }
  ];
}

export function buildJourneyHighlights(projection) {
  const { finalPoint, totalMonths, annualContribution, totalGain, milestoneHits, inputs } = projection;
  const snowballPoint = findFirstCrossing(
    projection.series,
    (point) => point.gain >= annualContribution
  );
  const firstBigHit = milestoneHits.find((hit) => hit.target >= 100000) ?? milestoneHits[0] ?? null;

  return [
    {
      label: "Time in market",
      value: formatDuration(totalMonths),
      copy: `${totalMonths} monthly deposits from age ${inputs.currentAge} to ${inputs.targetAge}.`
    },
    {
      label: "Snowball moment",
      value: snowballPoint ? `Age ${snowballPoint.age.toFixed(1)}` : "Still building",
      copy: snowballPoint
        ? `Projected gain matches one full year of DCA by ${snowballPoint.date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric"
          })}.`
        : "Extend the horizon or increase DCA to activate the snowball sooner."
    },
    {
      label: "Standout checkpoint",
      value: firstBigHit ? formatCurrency(firstBigHit.target) : formatCurrency(finalPoint.balance),
      copy: firstBigHit
        ? `Likely reached around ${firstBigHit.date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric"
          })}.`
        : `Projected gain lands at ${formatCurrency(totalGain)} by the finish line.`
    }
  ];
}

export function addMonths(date, count) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + count);
  return next;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
