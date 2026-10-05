import {analyzeFinancials, FinancialPeriod} from "./financial-analysis.js";

const periods: FinancialPeriod[] = [
  {
    period: "2026-Q1",
    revenue: 1000,
    costOfGoodsSold: 400,
    operatingExpenses: 300,
    cash: 180,
    accountsReceivable: 220,
    inventory: 150,
    accountsPayable: 200,
    currentAssets: 550,
    currentLiabilities: 400,
    totalAssets: 1200,
    totalLiabilities: 500,
    equity: 700,
    operatingCashFlow: 240,
    investingCashFlow: -100,
    financingCashFlow: 0
  },
  {
    period: "2026-Q2",
    revenue: 1200,
    costOfGoodsSold: 480,
    operatingExpenses: 360,
    cash: 210,
    accountsReceivable: 260,
    inventory: 170,
    accountsPayable: 250,
    currentAssets: 640,
    currentLiabilities: 500,
    totalAssets: 1300,
    totalLiabilities: 700,
    equity: 600,
    operatingCashFlow: 260,
    investingCashFlow: -140,
    financingCashFlow: 0
  }
];

const result = analyzeFinancials(periods);
if (result.metrics.length !== 2) throw new Error("Expected one metric set per period");
if (Math.abs(result.metrics[0].grossMargin - 0.6) > 0.0001) throw new Error("Gross margin calculation failed");
if (Math.abs((result.trend.revenueGrowth ?? 0) - 0.2) > 0.0001) throw new Error("Revenue growth calculation failed");
if (result.metrics[1].freeCashFlow !== 120) throw new Error("Free cash flow calculation failed");
if (!result.flags.some((flag) => flag.code === "HIGH_LEVERAGE")) throw new Error("Expected leverage warning");

console.log("financial-analysis tests passed");
