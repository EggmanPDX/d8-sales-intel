# D8_SALES_PITCH

This is the `D8_SALES_PITCH` workspace. The primary tool app is located in the `d8-sales-pitch/` folder and is a Vite-based webapp for D8TAOPS sales case studies.

> Note: the root folder contains an older Next.js starter app. The actual working product is `d8-sales-pitch/`.

## Project structure

- `d8-sales-pitch/` — main D8/SALES_PITCH webapp
- `SUMMARY.md` — current build status and tool description
- `README.md` — top-level workspace documentation

## How to run the actual tool

```bash
cd /Users/greggeiler/Developer/D8_SALES_PITCH/d8-sales-pitch
npm install
npm run dev
```

Then open the local app at the URL Vite reports, typically:

```bash
http://localhost:5173
```

If that port is in use, Vite will choose the next available port.

## What this tool does

`D8_SALES_PITCH` is a webapp for D8TAOPS sales teams to enter a specific case study and see how our agents will handle the work. It captures industry and use-case details, generates a tailored solution narrative, and produces sales-ready output such as:

- solution description
- ROI model
- slide deck outline
- export-ready content

## Notes

The root workspace is renamed to `D8_SALES_PITCH`, and the nested app is now `d8-sales-pitch/`.

If you want to work on the older Next.js starter files, they remain in the root `src/` folder, but the main product lives in `d8-sales-pitch/`.
