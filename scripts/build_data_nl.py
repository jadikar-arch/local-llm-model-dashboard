"""NL data. All numbers transcribed from europa MCP (CBS) tool results on 2026-11-21. Run: python3 scripts/build_data_nl.py"""
from datalib import *

LIC = "CC BY 4.0, (c) Centraal Bureau voor de Statistiek (CBS)"

# ---- housing: CBS 85792NED, annual (JJ00), price index 2020=100 and average sale price EUR
Y = [str(y) for y in range(2015, 2026)]
IDX = {  # M001505_2
 "Netherlands": [69.5,73.3,79.3,86.6,92.7,100,115.1,130.4,126.6,137.7,149.5],
 "Amsterdam":   [61.9,70.2,80.1,90.3,95.5,100,111.5,123.8,117.6,127.9,132.4],
 "Rotterdam":   [61.5,65.9,74.4,85.2,92.2,100,114,128,124.5,132.5,142.1],
 "The Hague":   [63.7,68.9,76.6,86.2,93,100,114.5,127.1,122.4,131.2,141.4],
 "Utrecht":     [61.2,67.2,75.3,83.7,91.4,100,116,128.8,119.8,138.1,151.1]}
AVG = {  # M001534
 "Netherlands": [230194,243837,263295,287267,307978,334488,386714,428591,416153,450985,479527],
 "Amsterdam":   [303925,358976,407670,460705,484995,510919,569890,620955,568161,617647,630621],
 "Rotterdam":   [189536,202501,227834,256784,282910,307358,364018,397864,383652,402854,414580],
 "The Hague":   [231302,244849,266672,304889,324838,355807,411718,454312,413690,447418,465419],
 "Utrecht":     [245900,267618,307737,344015,379770,405791,469949,510981,474407,519924,549113]}
rows = []
for g in IDX: rows += series_rows(g, "Price index (2020=100)", Y, IDX[g])
for g in AVG: rows += series_rows(g, "Average sale price (EUR)", Y, AVG[g])
nl = lambda s, p: at(rows, "Netherlands", s, p)
story = (f"Existing-home prices in the Netherlands rose from an average of EUR {nl('Average sale price (EUR)','2015'):,.0f} in 2015 to EUR {nl('Average sale price (EUR)','2025'):,.0f} in 2025 "
         f"(+{pct(nl('Average sale price (EUR)','2025'), nl('Average sale price (EUR)','2015')):.0f}%). After a dip in 2023 (index {nl('Price index (2020=100)','2023')}), prices climbed "
         f"{pct(nl('Price index (2020=100)','2025'), nl('Price index (2020=100)','2024')):.1f}% in 2025. Utrecht (index {at(rows,'Utrecht','Price index (2020=100)','2025')}) now leads the four big cities.")
save("nl", "housing", "Existing home prices", "index 2020=100", {"Price index (2020=100)": "index 2020=100", "Average sale price (EUR)": "EUR"},
     "CBS StatLine 85792NED", "https://opendata.cbs.nl/#/CBS/nl/dataset/85792NED/table", LIC, rows, story)

# ---- energy: CBS 85005NED solar PV, annual 2019-2025. kWp -> MW (/1000); production mln kWh = GWh
Y = [str(y) for y in range(2019, 2026)]
CAP = {  # M002461, sector 'all economic activity and homes', kWp
 "Netherlands":   [7225864,11108427,14822880,19536096,24712301,27837710,29185467],
 "Groningen":     [491687,942544,1156477,1334696,1668374,1912551,2020632],
 "Fryslan":       [440734,701584,865297,1040289,1292256,1393096,1452521],
 "Drenthe":       [372062,603405,897359,1373921,1632026,1732273,1830538],
 "Overijssel":    [605941,945375,1268994,1610957,2010296,2314267,2425600],
 "Flevoland":     [329471,483727,585708,893172,1165794,1318723,1346234],
 "Gelderland":    [887853,1360800,1885896,2492612,3248867,3774182,3929660],
 "Utrecht":       [405418,593814,781852,1047213,1309186,1512069,1573111],
 "Noord-Holland": [785626,1107106,1440930,1872015,2268880,2536794,2654609],
 "Zuid-Holland":  [793551,1167813,1628720,2261226,2876886,3322077,3468269],
 "Zeeland":       [324537,442561,543027,775686,890463,1100740,1127002],
 "Noord-Brabant": [1214795,1860232,2577937,3332012,4343649,4704678,4963399],
 "Limburg":       [572886,897642,1176294,1485089,1946336,2160818,2221194]}
rows = []
for g, v in CAP.items(): rows += series_rows(g, "Installed capacity (MW)", Y, v, scale=1000, nd=0)
rows += series_rows("Netherlands", "Capacity: homes (MW)", Y, [3236417,4488623,5843084,8014761,10342496,11700112,12158832], scale=1000, nd=0)
rows += series_rows("Netherlands", "Capacity: businesses (MW)", Y, [3989447,6619804,8979796,11521334,14369805,16137598,17026635], scale=1000, nd=0)
rows += series_rows("Netherlands", "Solar production (GWh)", Y, [5399,8567,11304,16659,19607,21942,25813])
rows += series_rows("Netherlands", "Production: homes (GWh)", Y, [2620,3714,4652,6760,8341,9695,11402])
rows += series_rows("Netherlands", "Production: businesses (GWh)", Y, [2779,4853,6652,9899,11266,12246,14411])
c19, c25 = at(rows,"Netherlands","Installed capacity (MW)","2019"), at(rows,"Netherlands","Installed capacity (MW)","2025")
p19, p25 = at(rows,"Netherlands","Solar production (GWh)","2019"), at(rows,"Netherlands","Solar production (GWh)","2025")
story = (f"Installed solar capacity in the Netherlands grew from {c19:,.0f} MW in 2019 to {c25:,.0f} MW in 2025 (x{c25/c19:.1f}), and solar production rose from {p19:,.0f} to {p25:,.0f} GWh. "
         f"Noord-Brabant has the most capacity ({at(rows,'Noord-Brabant','Installed capacity (MW)','2025'):,.0f} MW); businesses account for {at(rows,'Netherlands','Capacity: businesses (MW)','2025')/c25*100:.0f}% of capacity.")
units = {"Installed capacity (MW)": "MW", "Capacity: homes (MW)": "MW", "Capacity: businesses (MW)": "MW", "Solar production (GWh)": "GWh", "Production: homes (GWh)": "GWh", "Production: businesses (GWh)": "GWh"}
save("nl", "energy", "Solar power in the Netherlands", "MW", units, "CBS StatLine 85005NED", "https://opendata.cbs.nl/#/CBS/nl/dataset/85005NED/table", LIC, rows, story)

# ---- prices: CBS 86141NED CPI annual change (%), monthly 2023-01..2026-10
P = months(2023, 1, 46)
ALL = [7.6,8,4.4,5.2,6.1,5.7,4.6,3,0.2,-0.4,1.7,1.2, 3.2,2.8,3.1,2.7,2.7,3.2,3.7,3.6,3.5,3.5,4,4.1, 3.3,3.7,3.6,4,3.2,3,2.9,2.8,3.2,3.1,2.8,2.9, 2.4,2.4,2.7,2.8,3.5,2.9,3.2,3.3,3.4,3.7]
FOOD = [17.7,18.4,18.4,15.9,15.2,13.1,11.7,9.7,9.4,7.9,6.3,4, 2.1,0.3,0.3,0.5,0.4,0.4,0.6,1,1.6,1.5,1.8,2.2, 3.1,3.8,3.5,3.6,3.7,3.7,3.9,3.5,3.7,3.6,2.8,2.7, 1.5,0.7,1.7,1.1,-0.2,-0.6,-0.3,-0.7,-1.7,-1.1]
ENG = [-3.4,-2.9,-36.5,-32.2,-24.9,-19.1,-34.5,-46.7,-57.4,-58.1,-42.8,-42.1, -9.2,-5.9,-2.9,-4.5,-3.6,-2.2,-0.3,0.2,0,2.2,1.4,0.5, -4,-2.9,-2.1,1,3.7,3.9,5.1,4.2,4.2,2.1,0.9,0.8, -0.5,-1.9,-2.1,-3.4,-2.4,-1.8,1.1,3.3,4.2,7]
assert len(ALL) == len(FOOD) == len(ENG) == len(P) == 46
rows = series_rows("Netherlands", "All items", P, ALL) + series_rows("Netherlands", "Food", P, FOOD) + series_rows("Netherlands", "Electricity, gas, fuels", P, ENG)
pk = max((r for r in rows if r["series"] == "All items"), key=lambda r: r["value"])
story = (f"Dutch consumer price inflation peaked at {pk['value']}% in {pk['period']} and stands at {ALL[-1]}% in 2026-10. Food prices swung from +{max(FOOD)}% (2023-02) to {FOOD[-1]}% now, "
         f"while energy prices fell as much as {min(ENG)}% (2023-10) and are now rising again at +{ENG[-1]}%.")
save("nl", "prices", "Consumer price inflation", "% change vs year earlier", {}, "CBS StatLine 86141NED", "https://opendata.cbs.nl/#/CBS/nl/dataset/86141NED/table", LIC, rows, story)
