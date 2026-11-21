"""DE data. Numbers transcribed from europa MCP tool results on 2026-11-21:
 - cars: Eurostat road_eqr_carpda (geo=DE, new passenger cars by motor energy). 'Plug-in hybrid' and 'Hybrid' are sums of the petrol and diesel variants.
 - energy: Eurostat nrg_bal_peh (geo=DE, gross electricity production, GWh).
 - prices: Destatis table 61111-0002 (CPI Germany, monthly). Destatis symbol '-' means zero.
Run: python3 scripts/build_data_de.py"""
from datalib import *

# ---------------- cars
Y = [str(y) for y in range(2013, 2026)]
TOTAL = [2952431,3036773,3206042,3285904,3441262,3435778,3607258,2917678,2622132,2651357,2844609,2817331,2857591]
BEV   = [6051,8522,12363,11410,25056,36062,63281,194163,355961,470559,524219,380609,545142]
Y2 = Y[4:]  # detail by drive type only available from 2017
PET   = [1986488,2142700,2136891,1361723,972588,863445,978660,991948,777641]
DIE   = [1336776,1111130,1152733,819896,524446,472274,486581,483261,395022]
HEV_P = [54009,81503,123799,220385,285898,312090,456426,571488,649880]
HEV_D = [1228,17312,70102,107009,143234,153135,208149,183998,166219]
PHEV_P= [28244,30839,37814,177963,301856,345083,166614,174653,292574]
PHEV_D= [1191,583,7432,22431,23581,17009,9109,17250,18818]
S = "New cars"
rows = series_rows("Germany", "All new passenger cars", Y, TOTAL) + series_rows("Germany", "Battery electric", Y, BEV)
rows += series_rows("Germany", "Petrol (no hybrid)", Y2, PET) + series_rows("Germany", "Diesel (no hybrid)", Y2, DIE)
rows += series_rows("Germany", "Hybrid (non plug-in)", Y2, [a + b for a, b in zip(HEV_P, HEV_D)])
rows += series_rows("Germany", "Plug-in hybrid", Y2, [a + b for a, b in zip(PHEV_P, PHEV_D)])
share = lambda y: at(rows, "Germany", "Battery electric", y) / at(rows, "Germany", "All new passenger cars", y) * 100
story = (f"Battery-electric cars grew from {share('2019'):.1f}% of new passenger car registrations in Germany in 2019 to {share('2023'):.1f}% in 2023, fell back to {share('2024'):.1f}% in 2024 "
         f"and recovered to {share('2025'):.1f}% in 2025 ({at(rows,'Germany','Battery electric','2025'):,.0f} cars, +{pct(at(rows,'Germany','Battery electric','2025'), at(rows,'Germany','Battery electric','2024')):.0f}% on 2024). "
         f"New diesel (non-hybrid) registrations dropped from {at(rows,'Germany','Diesel (no hybrid)','2017'):,.0f} in 2017 to {at(rows,'Germany','Diesel (no hybrid)','2025'):,.0f} in 2025.")
save("de", "cars", "New passenger cars by drive type", "cars", {s: "cars" for s in set(r["series"] for r in rows)},
     "Eurostat road_eqr_carpda (Germany)", "https://ec.europa.eu/eurostat/databrowser/view/road_eqr_carpda/default/table?lang=en", "CC BY 4.0, (c) European Union (Eurostat)", rows, story)

# ---------------- energy
Y = [str(y) for y in range(2013, 2025)]
E = {
 "Total generation": [638701,627806,648308,650449,653723,640468,606917,575462,592799.2,578948.015,522871,514009],
 "Wind": [52737,58497,80624,79924,105693,109951,125894,132102,114169,124816,141764,138914],
 "Solar PV": [31010,36056,38726,38098,39401,43459,44383,49496,50472,61022,64299,75379],
 "Hydro": [22998,19587,18976,20546,20150,17693,19731,18721,19657,17624,21244,23825],
 "Bioenergy": [45514,48288,50326,50929,50916,50794,50127,50931,50176.82,49571.946,52505.501,52447.991],
 "Lignite": [159055,154205,152679,147898,146918,144048,112614,90724,109147,115352,85796,78504],
 "Natural gas": [68737,62271,63017,82294,87685,83425,90753,96285,97025,83601,84525,90487],
 "Nuclear": [97290,97129,91786,84634,76324,76005,75071,64382,69130,34709,7216,0]}
rows = []
for s, v in E.items(): rows += series_rows("Germany", s + " (GWh)", Y, v, nd=0)
g = lambda s, y: at(rows, "Germany", s + " (GWh)", y)
ws = lambda y: (g("Wind", y) + g("Solar PV", y)) / g("Total generation", y) * 100
story = (f"Wind and solar produced {ws('2024'):.1f}% of Germany's gross electricity in 2024, up from {ws('2013'):.1f}% in 2013. Nuclear output fell from {g('Nuclear','2013'):,.0f} GWh to zero in 2024, "
         f"lignite halved from {g('Lignite','2013'):,.0f} to {g('Lignite','2024'):,.0f} GWh, and total generation dropped {abs(pct(g('Total generation','2024'), g('Total generation','2013'))):.0f}% since 2013.")
save("de", "energy", "Electricity generation by source", "GWh", {s + " (GWh)": "GWh" for s in E},
     "Eurostat nrg_bal_peh (Germany)", "https://ec.europa.eu/eurostat/databrowser/view/nrg_bal_peh/default/table?lang=en", "CC BY 4.0, (c) European Union (Eurostat)", rows, story)

# ---------------- prices (Destatis CPI, monthly 2025-01..2026-10)
P = months(2025, 1, 22)
YOY = [2.3,2.3,2.2,2.1,2.1,2.0,2.0,2.2,2.4,2.3,2.3,1.8, 2.1,1.9,2.7,2.9,2.6,2.3,2.8,2.9,3.3,2.8]
MOM = [-0.2,0.4,0.3,0.4,0.1,0.0,0.3,0.1,0.2,0.3,-0.2,0.0, 0.1,0.2,1.1,0.6,-0.2,-0.3,0.8,0.2,0.6,-0.1]
IDX = [120.3,120.8,121.2,121.7,121.8,121.8,122.2,122.3,122.6,123.0,122.7,122.7, 122.8,123.1,124.5,125.2,125.0,124.6,125.6,125.8,126.6,126.5]
assert len(YOY) == len(MOM) == len(IDX) == len(P) == 22
rows = series_rows("Germany", "Inflation, annual change (%)", P, YOY) + series_rows("Germany", "Change vs previous month (%)", P, MOM) + series_rows("Germany", "CPI index (2020=100)", P, IDX)
story = (f"German consumer price inflation stood at {YOY[-1]}% in October 2026, after a low of {min(YOY[:12])}% in December 2025 and a 2026 high of {max(YOY)}% in September. "
         f"The price level (2020=100) rose from {IDX[0]} in January 2025 to {IDX[-1]} in October 2026, with the biggest monthly jump (+{max(MOM)}%) in March 2026.")
save("de", "prices", "Consumer prices in Germany", "% change vs year earlier",
     {"Inflation, annual change (%)": "%", "Change vs previous month (%)": "%", "CPI index (2020=100)": "index 2020=100"},
     "Destatis 61111-0002", "https://www-genesis.destatis.de/genesis/online?operation=table&code=61111-0002", "Datenlizenz Deutschland - Namensnennung - 2.0 (dl-de/by-2-0), (c) Statistisches Bundesamt (Destatis)", rows, story)
