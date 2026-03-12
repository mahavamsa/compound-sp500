import {
  DEFAULT_ANNUAL_RETURN,
  buildJourneyHighlights,
  describeAchievements,
  formatCurrency,
  formatDuration,
  formatPercent,
  nearestMilestoneProgress,
  projectInvestment
} from "./projection.js";

const FALLBACK_MARKET = {
  indexLevel: 6775.8,
  ytdReturn: -0.0099,
  lastCloseDate: "2026-03-11",
  source: "Fallback snapshot"
};

const presets = {
  starter: { currentAge: 25, targetAge: 60, startingAmount: 1000, monthlyContribution: 250, annualReturn: 10 },
  steady: { currentAge: 30, targetAge: 60, startingAmount: 10000, monthlyContribution: 500, annualReturn: 10 },
  stretch: { currentAge: 35, targetAge: 65, startingAmount: 25000, monthlyContribution: 1500, annualReturn: 10 }
};

const form = document.querySelector("#projection-form");
const annualReturnInput = document.querySelector("#annual-return");
const annualReturnValue = document.querySelector("#annual-return-value");
const snapshotStatus = document.querySelector("#snapshot-status");
const indexLevelNode = document.querySelector("#index-level");
const ytdReturnNode = document.querySelector("#ytd-return");
const lastCloseDateNode = document.querySelector("#last-close-date");
const projectedBalanceNode = document.querySelector("#projected-balance");
const totalInvestedNode = document.querySelector("#total-invested");
const totalGainNode = document.querySelector("#total-gain");
const compoundingShareNode = document.querySelector("#compounding-share");
const contributionRaceNode = document.querySelector("#contribution-race");
const gainRaceNode = document.querySelector("#gain-race");
const nextMilestoneNode = document.querySelector("#next-milestone");
const milestoneProgressLabelNode = document.querySelector("#milestone-progress-label");
const milestoneProgressBar = document.querySelector("#milestone-progress-bar");
const nextMilestoneDateNode = document.querySelector("#next-milestone-date");
const futureAgeNode = document.querySelector("#future-age");
const futureSelfCopyNode = document.querySelector("#future-self-copy");
const investingHorizonNode = document.querySelector("#investing-horizon");
const depositCountNode = document.querySelector("#deposit-count");
const investorLevelNode = document.querySelector("#investor-level");
const levelPillNode = document.querySelector("#level-pill");
const levelCopyNode = document.querySelector("#level-copy");
const investedBarNode = document.querySelector("#invested-bar");
const gainBarNode = document.querySelector("#gain-bar");
const journeyHighlightsNode = document.querySelector("#journey-highlights");
const badgeGrid = document.querySelector("#badge-grid");
const chart = document.querySelector("#projection-chart");
const chartCaptionNode = document.querySelector("#chart-caption");

let marketSnapshot = FALLBACK_MARKET;

function renderSnapshot(snapshot) {
  indexLevelNode.textContent = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(snapshot.indexLevel);
  ytdReturnNode.textContent = formatPercent(snapshot.ytdReturn);
  ytdReturnNode.classList.toggle("positive", snapshot.ytdReturn >= 0);
  ytdReturnNode.classList.toggle("negative", snapshot.ytdReturn < 0);
  lastCloseDateNode.textContent = new Date(snapshot.lastCloseDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  snapshotStatus.textContent = snapshot.source;
}

async function loadMarketSnapshot() {
  try {
    const response = await fetch("/api/sp500");
    if (!response.ok) {
      throw new Error("Failed to load market data");
    }

    marketSnapshot = await response.json();
  } catch (error) {
    marketSnapshot = FALLBACK_MARKET;
  }

  renderSnapshot(marketSnapshot);
}

function readInputs() {
  return {
    currentAge: Number(form.currentAge.value),
    targetAge: Number(form.targetAge.value),
    startingAmount: Number(form.startingAmount.value),
    monthlyContribution: Number(form.monthlyContribution.value),
    annualReturn: Number(form.annualReturn.value) / 100 || DEFAULT_ANNUAL_RETURN
  };
}

function renderProjection() {
  const inputs = readInputs();
  annualReturnValue.textContent = `${(inputs.annualReturn * 100).toFixed(1)}%`;

  let projection;
  try {
    projection = projectInvestment(inputs);
  } catch (error) {
    renderErrorState(error.message);
    return;
  }

  const { finalPoint, compoundingShare, totalMonths, totalGain, totalInvested, investorLevel } = projection;
  const milestoneState = nearestMilestoneProgress(finalPoint.balance);
  const maxRaceValue = Math.max(totalInvested, totalGain, 1);
  const investedWidth = Math.max(10, Math.round((totalInvested / maxRaceValue) * 100));
  const gainWidth = Math.max(10, Math.round((Math.max(totalGain, 0) / maxRaceValue) * 100));
  const nextMilestoneHit = projection.milestoneHits.find((hit) => hit.target === milestoneState.nextMilestone) ?? null;

  projectedBalanceNode.textContent = formatCurrency(finalPoint.balance);
  totalInvestedNode.textContent = formatCurrency(totalInvested);
  totalGainNode.textContent = formatCurrency(totalGain);
  totalGainNode.classList.toggle("positive", totalGain >= 0);
  totalGainNode.classList.toggle("negative", totalGain < 0);
  compoundingShareNode.textContent = formatPercent(compoundingShare);
  contributionRaceNode.textContent = formatCurrency(totalInvested);
  gainRaceNode.textContent = formatCurrency(totalGain);
  nextMilestoneNode.textContent = milestoneState.nextMilestone ? formatCurrency(milestoneState.nextMilestone) : "All milestones cleared";
  milestoneProgressLabelNode.textContent = `${Math.round(milestoneState.progress * 100)}%`;
  milestoneProgressBar.style.width = `${Math.round(milestoneState.progress * 100)}%`;
  nextMilestoneDateNode.textContent = nextMilestoneHit
    ? nextMilestoneHit.date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : milestoneState.nextMilestone
      ? "Beyond current plan"
      : "Already achieved";
  futureAgeNode.textContent = `Age ${inputs.targetAge}`;
  futureSelfCopyNode.textContent = `At age ${inputs.targetAge}, this plan projects ${formatCurrency(finalPoint.balance)} with ${formatCurrency(totalGain)} from growth.`;
  investingHorizonNode.textContent = formatDuration(totalMonths);
  depositCountNode.textContent = `${totalMonths} monthly deposits`;
  investorLevelNode.textContent = investorLevel.label;
  levelPillNode.textContent = investorLevel.label;
  levelCopyNode.textContent = investorLevel.copy;
  investedBarNode.style.width = `${investedWidth}%`;
  gainBarNode.style.width = `${gainWidth}%`;

  renderJourneyHighlights(projection);
  renderBadges(projection);
  renderChart(projection.series);
  chartCaptionNode.textContent = `Starting with ${formatCurrency(inputs.startingAmount)} and adding ${formatCurrency(inputs.monthlyContribution)} per month over ${formatDuration(totalMonths)}.`;
}

function renderErrorState(message) {
  projectedBalanceNode.textContent = message;
  totalInvestedNode.textContent = "--";
  totalGainNode.textContent = "--";
  compoundingShareNode.textContent = "--";
  contributionRaceNode.textContent = "--";
  gainRaceNode.textContent = "--";
  nextMilestoneNode.textContent = "Adjust ages";
  milestoneProgressLabelNode.textContent = "0%";
  nextMilestoneDateNode.textContent = "--";
  milestoneProgressBar.style.width = "0%";
  futureAgeNode.textContent = "--";
  futureSelfCopyNode.textContent = "Projected value at your target age.";
  investingHorizonNode.textContent = "--";
  depositCountNode.textContent = "--";
  investorLevelNode.textContent = "--";
  levelPillNode.textContent = "--";
  levelCopyNode.textContent = "--";
  investedBarNode.style.width = "0%";
  gainBarNode.style.width = "0%";
  journeyHighlightsNode.innerHTML = "";
  badgeGrid.innerHTML = "";
  chart.innerHTML = "";
  chartCaptionNode.textContent = "--";
}

function renderJourneyHighlights(projection) {
  journeyHighlightsNode.innerHTML = "";

  buildJourneyHighlights(projection).forEach((item) => {
    const article = document.createElement("article");
    article.className = "card journey-card";
    article.innerHTML = `
      <p class="eyebrow">${item.label}</p>
      <strong>${item.value}</strong>
      <p>${item.copy}</p>
    `;
    journeyHighlightsNode.append(article);
  });
}

function renderBadges(projection) {
  badgeGrid.innerHTML = "";

  describeAchievements(projection).forEach((achievement) => {
    const article = document.createElement("article");
    article.className = `badge ${achievement.unlocked ? "unlocked" : "locked"}`;
    article.innerHTML = `
      <small>${achievement.unlocked ? "Unlocked" : "Locked"}</small>
      <strong>${achievement.title}</strong>
      <p class="badge-target">${achievement.target}</p>
      <p>${achievement.detail}</p>
    `;
    badgeGrid.append(article);
  });
}

function renderChart(series) {
  const width = 900;
  const height = 360;
  const padding = { top: 24, right: 24, bottom: 38, left: 68 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...series.map((point) => point.balance), ...series.map((point) => point.invested), 1);
  const xMax = Math.max(series.length - 1, 1);

  const x = (value) => padding.left + (value / xMax) * innerWidth;
  const y = (value) => height - padding.bottom - (value / maxValue) * innerHeight;

  const gridValues = [0.25, 0.5, 0.75, 1].map((step) => Math.round(maxValue * step));
  const balancePath = linePath(series, (point) => x(point.monthIndex), (point) => y(point.balance));
  const investedPath = linePath(series, (point) => x(point.monthIndex), (point) => y(point.invested));
  const endLabel = series[series.length - 1];
  const middleLabel = series[Math.floor(series.length / 2)];

  chart.innerHTML = `
    ${gridValues
      .map(
        (value) => `
          <line x1="${padding.left}" y1="${y(value)}" x2="${width - padding.right}" y2="${y(value)}" stroke="#e4d9c9" stroke-dasharray="4 8" />
          <text x="${padding.left - 10}" y="${y(value) + 4}" fill="#756450" font-size="12" text-anchor="end">${formatCurrency(value)}</text>
        `
      )
      .join("")}
    <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="#d8ccb8" />
    <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="#d8ccb8" />
    <path d="${investedPath}" fill="none" stroke="#3e6ea8" stroke-width="4" stroke-linecap="round" />
    <path d="${balancePath}" fill="none" stroke="#17824a" stroke-width="5" stroke-linecap="round" />
    <circle cx="${x(endLabel.monthIndex)}" cy="${y(endLabel.balance)}" r="6" fill="#17824a" />
    <circle cx="${x(endLabel.monthIndex)}" cy="${y(endLabel.invested)}" r="5" fill="#3e6ea8" />
    <text x="${padding.left}" y="${height - 12}" fill="#756450" font-size="12">Start</text>
    <text x="${x(middleLabel.monthIndex)}" y="${height - 12}" fill="#756450" font-size="12" text-anchor="middle">${middleLabel.date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}</text>
    <text x="${x(endLabel.monthIndex)}" y="${height - 12}" fill="#756450" font-size="12" text-anchor="end">${endLabel.date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}</text>
  `;
}

function linePath(series, getX, getY) {
  return series
    .map((point, index) => `${index === 0 ? "M" : "L"}${getX(point)},${getY(point)}`)
    .join(" ");
}

function applyPreset(name) {
  const preset = presets[name];
  if (!preset) {
    return;
  }

  Object.entries(preset).forEach(([key, value]) => {
    form.elements[key].value = String(value);
  });

  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.classList.toggle("active", button.dataset.preset === name);
  });

  renderProjection();
}

form.addEventListener("input", renderProjection);
document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => applyPreset(button.dataset.preset));
});

annualReturnInput.addEventListener("input", renderProjection);

applyPreset("steady");
loadMarketSnapshot();
