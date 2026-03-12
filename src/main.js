import {
  DEFAULT_ANNUAL_RETURN,
  describeMilestones,
  formatCurrency,
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
const badgeGrid = document.querySelector("#badge-grid");
const chart = document.querySelector("#projection-chart");

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
    projectedBalanceNode.textContent = error.message;
    totalInvestedNode.textContent = "--";
    totalGainNode.textContent = "--";
    compoundingShareNode.textContent = "--";
    contributionRaceNode.textContent = "--";
    gainRaceNode.textContent = "--";
    nextMilestoneNode.textContent = "Adjust ages";
    milestoneProgressLabelNode.textContent = "0%";
    milestoneProgressBar.style.width = "0%";
    badgeGrid.innerHTML = "";
    chart.innerHTML = "";
    return;
  }

  const { finalPoint, compoundingShare } = projection;
  const totalGain = finalPoint.balance - finalPoint.invested;
  const milestoneState = nearestMilestoneProgress(finalPoint.balance);

  projectedBalanceNode.textContent = formatCurrency(finalPoint.balance);
  totalInvestedNode.textContent = formatCurrency(finalPoint.invested);
  totalGainNode.textContent = formatCurrency(totalGain);
  totalGainNode.classList.toggle("positive", totalGain >= 0);
  totalGainNode.classList.toggle("negative", totalGain < 0);
  compoundingShareNode.textContent = formatPercent(compoundingShare);
  contributionRaceNode.textContent = formatCurrency(finalPoint.invested);
  gainRaceNode.textContent = formatCurrency(totalGain);
  nextMilestoneNode.textContent = milestoneState.nextMilestone ? formatCurrency(milestoneState.nextMilestone) : "All milestones cleared";
  milestoneProgressLabelNode.textContent = `${Math.round(milestoneState.progress * 100)}%`;
  milestoneProgressBar.style.width = `${Math.round(milestoneState.progress * 100)}%`;

  renderBadges(finalPoint.balance);
  renderChart(projection.series);
}

function renderBadges(balance) {
  badgeGrid.innerHTML = "";

  describeMilestones(balance).forEach((milestone) => {
    const article = document.createElement("article");
    article.className = `badge ${milestone.unlocked ? "unlocked" : "locked"}`;
    article.innerHTML = `
      <small>${milestone.unlocked ? "Unlocked" : "Next target"}</small>
      <strong>${formatCurrency(milestone.target)}</strong>
      <p>${milestone.unlocked ? "Compounding reached this checkpoint." : "Keep stacking monthly contributions and time in the market."}</p>
    `;
    badgeGrid.append(article);
  });
}

function renderChart(series) {
  const width = 900;
  const height = 360;
  const padding = { top: 24, right: 24, bottom: 38, left: 62 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...series.map((point) => point.balance), ...series.map((point) => point.invested));
  const xMax = series.length - 1;

  const x = (value) => padding.left + (value / xMax) * innerWidth;
  const y = (value) => height - padding.bottom - (value / maxValue) * innerHeight;

  const balancePath = linePath(series, (point) => x(point.monthIndex), (point) => y(point.balance));
  const investedPath = linePath(series, (point) => x(point.monthIndex), (point) => y(point.invested));

  const endLabel = series[series.length - 1];
  const middleLabel = series[Math.floor(series.length / 2)];

  chart.innerHTML = `
    <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="#d8ccb8" />
    <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="#d8ccb8" />
    <path d="${investedPath}" fill="none" stroke="#3e6ea8" stroke-width="4" stroke-linecap="round" />
    <path d="${balancePath}" fill="none" stroke="#17824a" stroke-width="5" stroke-linecap="round" />
    <circle cx="${x(endLabel.monthIndex)}" cy="${y(endLabel.balance)}" r="6" fill="#17824a" />
    <circle cx="${x(endLabel.monthIndex)}" cy="${y(endLabel.invested)}" r="5" fill="#3e6ea8" />
    <text x="${padding.left}" y="${padding.top - 4}" fill="#756450" font-size="12">${formatCurrency(maxValue)}</text>
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
