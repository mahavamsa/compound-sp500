const QUOTE_URL = "https://stooq.com/q/l/?s=%5Espx&i=d";
const HISTORY_URL = "https://stooq.com/q/d/l/?s=%5Espx&i=d";

export default async function handler(_request, response) {
  try {
    const [quoteResponse, historyResponse] = await Promise.all([
      fetch(QUOTE_URL, { headers: { "user-agent": "compound-sp500-app" } }),
      fetch(HISTORY_URL, { headers: { "user-agent": "compound-sp500-app" } })
    ]);

    if (!quoteResponse.ok || !historyResponse.ok) {
      throw new Error("Unable to load S&P 500 data");
    }

    const quoteText = await quoteResponse.text();
    const historyText = await historyResponse.text();

    const snapshot = buildSnapshot(quoteText, historyText);

    response.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=43200");
    response.status(200).json(snapshot);
  } catch (error) {
    response.status(200).json({
      indexLevel: 6775.8,
      ytdReturn: -0.0099,
      lastCloseDate: "2026-03-11",
      sourceKey: "fallback"
    });
  }
}

export function buildSnapshot(quoteCsv, historyCsv) {
  const quoteParts = quoteCsv.trim().split(",");
  const lastCloseDate = `${quoteParts[1].slice(0, 4)}-${quoteParts[1].slice(4, 6)}-${quoteParts[1].slice(6, 8)}`;
  const indexLevel = Number(quoteParts[6]);
  const historyRows = historyCsv.trim().split("\n").slice(1);
  const previousYearClose = findPreviousYearClose(historyRows, new Date(lastCloseDate).getFullYear());
  const ytdReturn = previousYearClose ? indexLevel / previousYearClose - 1 : 0;

  return {
    indexLevel,
    ytdReturn,
    lastCloseDate,
    sourceKey: "liveStooq"
  };
}

function findPreviousYearClose(rows, currentYear) {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const [date, , , , close] = rows[index].split(",");
    const year = Number(date.slice(0, 4));
    if (year < currentYear) {
      return Number(close);
    }
  }

  return null;
}
