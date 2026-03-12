# compound-sp500

An interactive Vercel-ready simulator that shows how lump-sum investing plus monthly S&P 500 dollar-cost averaging can compound over time.

## Features

- Live S&P 500 snapshot at load time
- Monthly investment projection from current age to target age
- Adjustable starting amount, monthly DCA, and annual return assumption
- Milestone badges and progress tracking
- SVG chart comparing portfolio value vs total invested

## Run locally

```bash
npm run dev
```

Then open `http://localhost:4173`.

## Test

```bash
npm test
```

## Notes

- The live market snapshot is educational context, not a prediction of future returns.
- Projection output is a simulation, not financial advice.
