import test from "node:test";
import assert from "node:assert/strict";

import {
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
