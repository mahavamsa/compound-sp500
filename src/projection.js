import {
  DEFAULT_LOCALE,
  formatCurrency,
  formatDate,
  formatDuration,
  getLocaleConfig
} from "./i18n.js";

export const DEFAULT_ANNUAL_RETURN = 0.1;
export const MILESTONES = [10000, 50000, 100000, 250000, 500000, 1000000, 2000000];

export function monthlyRateFromAnnual(annualReturn) {
  return Math.pow(1 + annualReturn, 1 / 12) - 1;
}

export function projectInvestment({
  currentAge,
  targetAge,
  startingAmount,
  monthlyContribution,
  annualReturn,
  locale = DEFAULT_LOCALE,
  startDate = new Date()
}) {
  const safeCurrentAge = Number(currentAge);
  const safeTargetAge = Number(targetAge);
  const safeStartingAmount = Number(startingAmount);
  const safeMonthlyContribution = Number(monthlyContribution);
  const safeAnnualReturn = Number(annualReturn);
  const strings = getLocaleConfig(locale);

  if (!Number.isFinite(safeCurrentAge) || !Number.isFinite(safeTargetAge)) {
    throw new Error(strings.errors.agesInvalid);
  }

  if (safeTargetAge <= safeCurrentAge) {
    throw new Error(strings.errors.targetAgeGreater);
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
  const investorLevel = getInvestorLevel(finalPoint.balance, locale);

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
        annualReturn: safeAnnualReturn,
        locale
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

export function getInvestorLevel(balance, locale = DEFAULT_LOCALE) {
  const levels = getLocaleConfig(locale).investorLevels;
  return (
    [...levels].reverse().find((level) => balance >= level.minimum) ??
    levels[0]
  );
}

export function describeAchievements(projection, locale = DEFAULT_LOCALE) {
  const { series, finalPoint, totalMonths, annualContribution, inputs } = projection;
  const startingAmount = inputs.startingAmount;
  const strings = getLocaleConfig(locale).achievements;
  const snowballPoint = findFirstCrossing(series, (point) => point.gain >= annualContribution);
  const doubledStartPoint =
    startingAmount > 0
      ? findFirstCrossing(series, (point) => point.balance >= startingAmount * 2)
      : null;

  return [
    {
      title: strings.habitBuilderTitle,
      target: strings.habitBuilderTarget,
      unlocked: totalMonths >= 120,
      detail:
        totalMonths >= 120
          ? strings.habitBuilderUnlocked(formatDuration(totalMonths, locale))
          : strings.habitBuilderLocked(formatDuration(totalMonths, locale))
    },
    {
      title: strings.snowballTitle,
      target: strings.snowballTarget,
      unlocked: Boolean(snowballPoint),
      detail: snowballPoint
        ? strings.snowballUnlocked(formatDuration(snowballPoint.monthIndex, locale))
        : strings.snowballLocked
    },
    {
      title: strings.doubleTitle,
      target: strings.doubleTarget,
      unlocked: Boolean(doubledStartPoint),
      detail: doubledStartPoint
        ? strings.doubleUnlocked(doubledStartPoint.age.toFixed(1))
        : startingAmount > 0
          ? strings.doubleLocked
          : strings.doubleNeedsStarting
    },
    {
      title: strings.sixFigureTitle,
      target: strings.sixFigureTarget,
      unlocked: finalPoint.balance >= 100000,
      detail:
        finalPoint.balance >= 100000
          ? strings.sixFigureUnlocked
          : strings.sixFigureLocked(formatCurrency(100000 - finalPoint.balance, locale))
    },
    {
      title: strings.halfMillionTitle,
      target: strings.halfMillionTarget,
      unlocked: finalPoint.balance >= 500000,
      detail:
        finalPoint.balance >= 500000
          ? strings.halfMillionUnlocked
          : strings.halfMillionLocked(formatCurrency(500000 - finalPoint.balance, locale))
    },
    {
      title: strings.millionaireTitle,
      target: strings.millionaireTarget,
      unlocked: finalPoint.balance >= 1000000,
      detail:
        finalPoint.balance >= 1000000
          ? strings.millionaireUnlocked
          : strings.millionaireLocked(formatCurrency(1000000 - finalPoint.balance, locale))
    }
  ];
}

export function buildJourneyHighlights(projection, locale = DEFAULT_LOCALE) {
  const { finalPoint, totalMonths, annualContribution, totalGain, milestoneHits, inputs } = projection;
  const strings = getLocaleConfig(locale).journey;
  const snowballPoint = findFirstCrossing(
    projection.series,
    (point) => point.gain >= annualContribution
  );
  const firstBigHit = milestoneHits.find((hit) => hit.target >= 100000) ?? milestoneHits[0] ?? null;

  return [
    {
      label: strings.timeInMarketLabel,
      value: formatDuration(totalMonths, locale),
      copy: strings.timeInMarketCopy(totalMonths, inputs.currentAge, inputs.targetAge)
    },
    {
      label: strings.snowballMomentLabel,
      value: snowballPoint ? strings.snowballMomentValue(snowballPoint.age.toFixed(1)) : strings.stillBuilding,
      copy: snowballPoint
        ? strings.snowballMomentCopy(
            formatDate(snowballPoint.date, locale, {
              month: "short",
              year: "numeric"
            })
          )
        : strings.snowballMomentLocked
    },
    {
      label: strings.standoutCheckpointLabel,
      value: firstBigHit ? formatCurrency(firstBigHit.target, locale) : formatCurrency(finalPoint.balance, locale),
      copy: firstBigHit
        ? strings.standoutCheckpointCopy(
            formatDate(firstBigHit.date, locale, {
              month: "short",
              year: "numeric"
            })
          )
        : strings.standoutCheckpointFallback(formatCurrency(totalGain, locale))
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
