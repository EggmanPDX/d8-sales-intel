# D8/SALES_PITCH Summary

## Where we are
- The workspace has been renamed to `D8_SALES_PITCH`.
- The main tool is now in the `d8-sales-pitch/` folder.
- The root folder still contains the default Next.js starter app, but the active sales enablement tool is the Vite-based app in `d8-sales-pitch/`.
- Project metadata and folder references have been updated from the old `sales-leader-tool` and `d8-sales-intel` names.

## What this tool is
`D8/SALES_PITCH` is a webapp for D8TAOPS sales teams to input a specific case study and see how the platform’s agents will handle the work.

It is designed to:
- accept a target industry and business case
- capture a specific case study scenario
- simulate how D8TAOPS agents will research, architect, and build the solution
- produce structured outputs such as solution narratives, ROI estimates, and sales-ready export content

## Current status
- The nested app folder is renamed to `d8-sales-pitch/`.
- The Vite app is configured to run under that folder.
- Existing documentation and config files have been updated to reflect the new project name.

## How to run it
```bash
cd /Users/greggeiler/Developer/D8_SALES_PITCH/d8-sales-pitch
npm install
npm run dev
```

Then open the local app at the address Vite reports, typically `http://localhost:5173` or the next available port.
