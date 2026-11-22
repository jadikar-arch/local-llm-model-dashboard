# Task queue (driver picks the first `- [ ]`; legend: [ ] open, [x] done, [!] blocked)
# Format: - [ ] ID | TYPE | country | topic | brief      (never use the pipe character inside a brief)
# DATA tasks: the LOCAL MODEL fetches the data itself with the europa MCP (find_data, cbs_*, eurostat_*, govdata_table). Gate = validate_data.py + check_provenance.py (numbers must appear in europa tool results).
# Order matters: each country is finished (data -> build -> QA -> polish) before the next starts.


# ---------------- NETHERLANDS (CBS tools: cbs_*) ----------------
- [!] NL-D1 | DATA | nl | housing | Netherlands housing crisis. Prefer: existing-home sale prices index / average price, plus dwelling stock or building permits. Use cbs_search for "koopwoningen" or "woningvoorraad". Monthly or yearly, 2015 to latest, national plus 2-5 provinces or the 4 big cities if available.
- [x] NL-D2 | DATA | nl | energy | Netherlands energy transition. Prefer: solar PV capacity or renewable electricity share, plus gas or electricity consumption. Use cbs_search for "zonnestroom" or "hernieuwbare energie". Yearly 2010 to latest.
- [!] NL-D3 | DATA | nl | prices | Netherlands cost of living. Prefer: consumer price index inflation (CPI) with a few categories (food, energy, housing). cbs_search "consumentenprijzen". Monthly 2019 to latest.
- [!] NL-S1 | SHELL | nl | - | Create site/nl/index.html and site/nl/app.js that call Kit.mount with the 3 topics (housing, energy, prices) using stub render functions that print the topic title. Page must load in qa without console errors.
- [x] NL-V1 | TOPIC | nl | housing | Write site/nl/topics/housing.js (render function) and register it in site/nl/app.js. 3+ KPIs, 2+ charts, region filter, table, insight.
- [x] NL-V2 | TOPIC | nl | energy | Write site/nl/topics/energy.js and register it. Same minimum content.
- [x] NL-V3 | TOPIC | nl | prices | Write site/nl/topics/prices.js and register it. Same minimum content.
- [!] NL-Q | QA | nl | - | Run `node scripts/qa.mjs nl` and fix every FAIL until QA RESULT: PASS. Then use the Playwright MCP (browser_snapshot, browser_console_messages) for one manual pass of each tab.
- [!] NL-P | POLISH | nl | - | Raise professional quality of the NL dashboard using references/polish-checklist.md. Keep QA at PASS.

# ---------------- EUROPEAN UNION (Eurostat tools: eurostat_*) ----------------
- [x] EU-D1 | DATA | eu | ai | EU enterprises using artificial intelligence (Eurostat isoc_eb_ai or similar, use find_data "artificial intelligence enterprises"). Compare 8-12 member states incl. NL and DE plus EU27 average, by year.
- [ ] EU-D2 | DATA | eu | renewables | EU renewable energy share in gross final consumption (nrg_ind_ren or similar), yearly, 8-12 member states incl. NL and DE plus EU27.
- [ ] EU-D3 | DATA | eu | inflation | EU HICP inflation annual rate (prc_hicp_manr or similar), monthly 2019 to latest, 8-12 member states incl. NL and DE plus euro area, headline plus maybe energy and food.
- [ ] EU-S1 | SHELL | eu | - | Create site/eu/index.html and site/eu/app.js with Kit.mount for topics ai, renewables, inflation (stubs first).
- [ ] EU-V1 | TOPIC | eu | ai | Write site/eu/topics/ai.js and register it. Country-compare bar plus time line, country filter.
- [ ] EU-V2 | TOPIC | eu | renewables | Write site/eu/topics/renewables.js and register it.
- [ ] EU-V3 | TOPIC | eu | inflation | Write site/eu/topics/inflation.js and register it.
- [ ] EU-Q | QA | eu | - | Run `node scripts/qa.mjs eu` and fix every FAIL until PASS, then one manual Playwright MCP pass.
- [ ] EU-P | POLISH | eu | - | Polish the EU dashboard using references/polish-checklist.md. Keep QA at PASS.

# ---------------- GERMANY (Destatis/GovData via find_data; Eurostat geo=DE is the safe fallback) ----------------
- [ ] DE-D1 | DATA | de | cars | Germany car industry and electric mobility: new passenger car registrations by drive type (electric, hybrid, petrol, diesel) or production. find_data "Pkw Neuzulassungen Elektro". If no German table works within 3 tries use Eurostat road_eqr_carpda with geo=DE and peers.
- [ ] DE-D2 | DATA | de | energy | Germany Energiewende: electricity generation by source (wind, solar, coal, gas, nuclear) or renewable share. find_data "Stromerzeugung erneuerbare". Fallback Eurostat nrg_ind_ren / nrg_bal geo=DE.
- [ ] DE-D3 | DATA | de | prices | Germany inflation and wages: consumer price index annual change, real wage or earnings index. find_data "Verbraucherpreisindex". Fallback Eurostat prc_hicp_manr geo=DE plus lc_lci_r2_a.
- [ ] DE-S1 | SHELL | de | - | Create site/de/index.html and site/de/app.js with Kit.mount for topics cars, energy, prices (stubs first).
- [ ] DE-V1 | TOPIC | de | cars | Write site/de/topics/cars.js and register it.
- [ ] DE-V2 | TOPIC | de | energy | Write site/de/topics/energy.js and register it.
- [ ] DE-V3 | TOPIC | de | prices | Write site/de/topics/prices.js and register it.
- [ ] DE-Q | QA | de | - | Run `node scripts/qa.mjs de` and fix every FAIL until PASS, then one manual Playwright MCP pass.
- [ ] DE-P | POLISH | de | - | Polish the DE dashboard using references/polish-checklist.md. Keep QA at PASS.

# ---------------- FINISH ----------------
- [ ] HOME-1 | HOME | home | - | Create site/index.html: a landing page with hero, and exactly 3 `a.card` links (inside a `.landing` grid) to nl, eu, de dashboards, each listing its 3 topics as `.pill`s and one headline number read from its data JSON. Use shared/theme.css.
- [ ] FIN-1 | QA | nl | - | Final regression: run `node scripts/qa.mjs nl`, then eu, then de, then home. Fix any FAIL. Keep fixes surgical.
- [ ] FIN-2 | DOCS | all | - | Write RESULTS.md at repo root: how to open the dashboards (python3 -m http.server 8000, then http://localhost:8000/site/index.html), the 9 topics with dataset ids and sources, known limitations, which tasks were blocked and why, and 5 honest lines on how the local model performed.
