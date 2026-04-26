# Livra — Last-Mile Delivery SaaS

## Project
Last-mile delivery tracking and route optimization platform for Moldovan companies.

## Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS (darkMode: 'class')
- **Maps**: react-leaflet + Leaflet, CartoDB tiles, OSRM routing
- **Backend**: Python FastAPI (`livra-api/`), OR-Tools VRP solver, Nominatim geocoding
- **Language**: Romanian UI throughout

## Structure
- `src/pages/` — Dashboard, Routes, Drivers, Credits, Integrations, Track
- `src/components/` — Layout (collapsible sidebar), ThemeContext
- `livra-api/main.py` — FastAPI backend (optimize, webhook endpoints)
- `livra-woocommerce/` — WooCommerce PHP plugin
- `livra-opencart/` — OpenCart 3.x extension

## Dev
- Frontend: `npm run dev` (port 3003)
- Backend: `cd livra-api && py -m uvicorn main:app --reload --port 8000`

## Key decisions
- All data is currently mock/useState — Supabase integration pending (needs project URL + anon key)
- OR-Tools VRP with OSRM duration matrix for route optimization
- Driver map markers are side-profile SVG delivery vans (L.divIcon), not circles
- Leaflet tooltip override: `white-space: normal !important` in index.css
