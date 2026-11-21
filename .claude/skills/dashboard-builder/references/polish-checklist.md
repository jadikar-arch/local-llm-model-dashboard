# Polish checklist (text-only verifiable)
1. Every chart card has a title AND a subtitle with unit and period. No chart without units on the axis or tooltip.
2. Numbers: thousands separators, 1 decimal max for percentages, no raw floats like 12.300000001 (use Kit.fmt).
3. KPI deltas have a meaning (note text such as "vs previous year"); good/bad colors only where direction matters (not for prices going up = bad? decide and note it).
4. Insight box says something non-obvious with real numbers; headline and subtitle are specific, not generic.
5. Add a second insight or annotation per topic if the data supports it (largest riser, peak year, gap between two regions).
6. Dark mode: toggle the theme in Playwright (`browser_evaluate`: `document.documentElement.dataset.theme='dark'`) and verify no chart redraw errors in console.
7. Mobile 390px: qa shows no horizontal overflow; tabs wrap; tables scroll inside their card.
8. Keyboard/a11y: tabs are buttons (ok), selects have visible labels, `<html lang>` set, images none. Add `aria-label` to canvases (`canvas.setAttribute('role','img')` + label).
9. Empty/edge states: selecting a region with null data shows the `.empty` message, not a blank card.
10. Last: reread the topic file once for dead code, console.log leftovers, and TODO comments; remove them.
11. Regions-compared bar: exclude the national/EU aggregate row (e.g. Netherlands, EU27, Germany total) from the bars when other regions exist, otherwise the scale is dominated by it; highlight the selected region with a different color.
12. KPI wording: give each KPI a topic-specific label (e.g. "Average sale price" instead of "Latest"), and unit-aware formatting (EUR with thousands separators, % with one decimal).
13. Each tab: add one extra chart that tells a different story (stacked bar of shares, or index-vs-price scatter as line) using only data.rows.
