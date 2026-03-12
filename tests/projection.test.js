import test from "node:test";
import assert from "node:assert/strict";

import {
  describeAchievements,
  findMilestoneHits,
  getInvestorLevel,
  monthlyRateFromAnnual,
  nearestMilestoneProgress,
  projectInvestment
} from "../src/projection.js";

test("monthly rate converts annual return into a positive monthly rate", () => {
  const monthlyRate = monthlyRateFromAnnual(0.1);
  assert.ok(monthlyRate > 0);
  assert.ok(monthlyRate < 0.01);
});

test("projection creates a monthly series through the target age", () => {
  const projection = projectInvestment({
    currentAge: 30,
    targetAge: 31,
    startingAmount: 1000,
    monthlyContribution: 100,
    annualReturn: 0.12,
    startDate: new Date("2026-01-01")
  });

  assert.equal(projection.totalMonths, 12);
  assert.equal(projection.series.length, 13);
  assert.equal(projection.finalPoint.invested, 2200);
  assert.ok(projection.finalPoint.balance > projection.finalPoint.invested);
});

test("projection rejects a target age that is not greater than the current age", () => {
  assert.throws(
    () =>
      projectInvestment({
        currentAge: 40,
        targetAge: 40,
        startingAmount: 0,
        monthlyContribution: 0,
        annualReturn: 0.1
      }),
    /Target age must be greater/
  );
});

test("milestone progress is capped between zero and one", () => {
  const state = nearestMilestoneProgress(125000);
  assert.equal(state.nextMilestone, 250000);
  assert.ok(state.progress > 0);
  assert.ok(state.progress < 1);
});

test("milestone hits record the first month each target is reached", () => {
  const projection = projectInvestment({
    currentAge: 25,
    targetAge: 35,
    startingAmount: 5000,
    monthlyContribution: 1200,
    annualReturn: 0.1,
    startDate: new Date("2026-01-01")
  });

  const hits = findMilestoneHits(projection.series);
  assert.equal(hits[0].target, 10000);
  assert.ok(hits[0].monthIndex > 0);
  assert.ok(hits.some((hit) => hit.target === 100000));
});

test("investor level reflects the projected ending balance", () => {
  assert.equal(getInvestorLevel(20000).label, "Seed Starter");
  assert.equal(getInvestorLevel(125000).label, "Six-Figure Climber");
  assert.equal(getInvestorLevel(2500000).label, "Freedom Engine");
});

test("achievements unlock when the projected path crosses key thresholds", () => {
  const projection = projectInvestment({
    currentAge: 25,
    targetAge: 55,
    startingAmount: 20000,
    monthlyContribution: 1000,
    annualReturn: 0.1,
    startDate: new Date("2026-01-01")
  });

  const achievements = describeAchievements(projection);
  assert.equal(achievements[0].title, "Habit Builder");
  assert.equal(achievements[0].unlocked, true);
  assert.ok(achievements.some((achievement) => achievement.title === "Six-Figure Club" && achievement.unlocked));
});
