"""EU data. All numbers transcribed from europa MCP (Eurostat) tool results on 2026-11-21. Run: python3 scripts/build_data_eu.py"""
from datalib import *

LIC = "CC BY 4.0, (c) European Union (Eurostat)"
def transpose(period_major, geos, periods, series):
    rows = []
    for gi, g in enumerate(geos):
        rows += series_rows(g, series, periods, [pm[gi] for pm in period_major])
    return rows

# ---- AI: Eurostat isoc_eb_ai, indicator E_AI_TANY, enterprises with 10+ employees, % of enterprises. No survey year 2022.
G = ["EU27", "Belgium", "Denmark", "Germany", "Ireland", "Spain", "France", "Italy", "Netherlands", "Austria", "Poland", "Finland", "Sweden"]
P = ["2021", "2023", "2024", "2025"]
AI = {  # geo -> values for 2021, 2023, 2024, 2025
 "EU27": [7.65, 8.06, 13.48, 19.95], "Belgium": [10.32, 13.81, 24.71, 34.54], "Denmark": [23.89, 15.17, 27.58, 42.03],
 "Germany": [10.56, 11.55, 19.75, 25.97], "Ireland": [7.88, 8.01, 14.9, 19.64], "Spain": [7.67, 9.18, 11.31, 20.27],
 "France": [6.67, 5.88, 9.91, 18.16], "Italy": [6.17, 5.05, 8.2, 16.4], "Netherlands": [13.1, 14.1, 23.06, 33.21],
 "Austria": [8.83, 10.79, 20.27, 29.95], "Poland": [2.86, 3.67, 5.9, 8.36], "Finland": [15.79, 15.1, 24.37, 37.82], "Sweden": [9.92, 10.37, 25.09, 35.04]}
rows = []
for g in G: rows += series_rows(g, "Enterprises using AI (%)", P, AI[g])
rows += series_rows("EU27", "Small firms 10-49 staff (%)", P, [6.12, 6.41, 11.21, 17])
rows += series_rows("EU27", "Medium firms 50-249 staff (%)", P, [12.55, 13.07, 20.97, 30.36])
rows += series_rows("EU27", "Large firms 250+ staff (%)", P, [28.41, 30.48, 41.17, 55.03])
eu = lambda p: at(rows, "EU27", "Enterprises using AI (%)", p)
rank = sorted(G[1:], key=lambda g: -at(rows, g, "Enterprises using AI (%)", "2025"))
story = (f"The share of EU enterprises (10+ staff) using AI jumped from {eu('2021')}% in 2021 to {eu('2025')}% in 2025 (it was {eu('2024')}% in 2024). "
         f"Denmark leads this selection at {at(rows,'Denmark','Enterprises using AI (%)','2025')}%, the Netherlands is at {at(rows,'Netherlands','Enterprises using AI (%)','2025')}%, "
         f"Germany sits at {at(rows,'Germany','Enterprises using AI (%)','2025')}% and Poland trails at {at(rows,'Poland','Enterprises using AI (%)','2025')}%. Large firms (55.03%) are far ahead of small ones (17%). No survey was run in 2022.")
save("eu", "ai", "Enterprises using artificial intelligence", "% of enterprises", {s: "% of enterprises" for s in set(r["series"] for r in rows)},
     "Eurostat isoc_eb_ai", "https://ec.europa.eu/eurostat/databrowser/view/isoc_eb_ai/default/table?lang=en", LIC, rows, story)

# ---- Renewables: Eurostat nrg_ind_ren, % share. 2025 values provisional. Order: EU27, BE, DK, DE, ES, FR, IT, NL, AT, PL, FI, SE
G = ["EU27", "Belgium", "Denmark", "Germany", "Spain", "France", "Italy", "Netherlands", "Austria", "Poland", "Finland", "Sweden"]
Y = [str(y) for y in range(2015, 2026)]
REN = [  # year-major
 [17.82, 8.06, 30.469, 14.901, 16.221, 14.803, 17.525, 5.714, 33.497, 11.881, 39.23, 52.22],
 [17.978, 8.744, 31.715, 14.885, 17.015, 15.451, 17.415, 5.846, 33.37, 11.396, 38.943, 52.597],
 [18.411, 9.136, 34.387, 15.472, 17.118, 15.847, 18.267, 6.507, 33.136, 11.059, 40.857, 53.39],
 [19.096, 9.472, 35.159, 16.66, 17.023, 16.384, 17.796, 7.394, 33.784, 14.936, 41.185, 53.916],
 [19.887, 9.929, 37.02, 17.266, 17.852, 17.174, 18.181, 8.886, 33.755, 15.377, 42.807, 55.785],
 [22.038, 13, 31.681, 19.09, 21.22, 19.109, 20.359, 13.999, 36.545, 16.102, 43.939, 60.124],
 [21.897, 13.017, 41.494, 19.302, 20.552, 19.391, 18.888, 13.117, 34.643, 15.604, 42.819, 62.527],
 [23.003, 13.831, 41.368, 20.829, 21.837, 20.33, 18.826, 15.291, 34.057, 16.644, 47.74, 66.287],
 [24.579, 14.673, 43.728, 21.512, 24.981, 22.462, 19.179, 17.588, 41.6, 16.651, 50.784, 66.393],
 [25.241, 14.336, 46.461, 22.474, 25.417, 23.229, 19.385, 20.18, 42.951, 17.77, 52.124, 62.846],
 [26.2, 14.9, 48.2, 23.9, 26, 23.9, 20.5, 22.7, 44.2, 18.7, 53, 65.4]]
ELC = [
 [29.655, 15.573, 51.292, 30.882, 36.972, 18.821, 33.459, 11.04, 71.487, 13.401, 32.207, 65.733],
 [30.172, 15.834, 53.717, 32.273, 36.676, 19.209, 34.012, 12.55, 72.521, 13.342, 32.716, 64.869],
 [31.104, 17.214, 59.94, 34.612, 36.465, 19.933, 34.104, 13.812, 71.626, 13.082, 35.044, 65.909],
 [32.134, 18.886, 62.394, 37.591, 35.236, 21.131, 33.93, 15.171, 74.189, 13.027, 36.539, 66.228],
 [34.086, 20.817, 65.347, 40.604, 37.131, 22.389, 34.969, 18.23, 75.067, 14.356, 37.969, 71.234],
 [37.408, 25.122, 65.323, 44.215, 42.944, 24.819, 38.081, 26.407, 78.204, 16.237, 39.564, 74.495],
 [37.793, 26.035, 73.181, 43.964, 45.994, 24.815, 35.996, 33.251, 74.008, 17.167, 39.583, 75.76],
 [41.239, 29.505, 76.708, 48.041, 50.888, 27.36, 37.102, 39.651, 73.64, 21.009, 47.966, 83.372],
 [45.397, 31.368, 78.975, 51.945, 56.915, 30.295, 38.905, 46.419, 87.899, 25.793, 52.374, 87.547],
 [47.503, 31.274, 79.655, 54.084, 59.673, 31.344, 40.654, 50.545, 90.065, 30.37, 54.309, 88.143],
 [49.9, 34.3, 77.7, 57.9, 60.7, 33.1, 43.5, 54.7, 90.8, 32.5, 56.6, 89.2]]
rows = transpose(REN, G, Y, "Renewables, total energy (%)") + transpose(ELC, G, Y, "Renewables, electricity (%)")
v = lambda g, s, y: at(rows, g, s, y)
S1, S2 = "Renewables, total energy (%)", "Renewables, electricity (%)"
story = (f"Renewables covered {v('EU27',S1,'2025')}% of EU gross final energy consumption in 2025 (provisional), up from {v('EU27',S1,'2015')}% in 2015, and {v('EU27',S2,'2025')}% of electricity. "
         f"The Netherlands more than tripled its share ({v('Netherlands',S1,'2015')}% to {v('Netherlands',S1,'2025')}%), Germany reached {v('Germany',S1,'2025')}% overall and {v('Germany',S2,'2025')}% in electricity, "
         f"while Sweden ({v('Sweden',S1,'2025')}%) and Finland ({v('Finland',S1,'2025')}%) lead.")
save("eu", "renewables", "Renewable energy share", "% share", {S1: "%", S2: "%"}, "Eurostat nrg_ind_ren", "https://ec.europa.eu/eurostat/databrowser/view/nrg_ind_ren/default/table?lang=en", LIC + "; 2025 provisional", rows, story)

# ---- Inflation: Eurostat prc_hicp_manr, all-items HICP, annual rate of change %, monthly 2023-01..2025-12. Order EU27, DE, ES, FR, NL, PL
G = ["EU27", "Germany", "Spain", "France", "Netherlands", "Poland"]
M = months(2023, 1, 36)
H = [
 [10,9.2,5.9,7,8.4,15.9],[9.9,9.3,6,7.3,8.9,17.2],[8.3,7.8,3.1,6.7,4.5,15.2],[8.1,7.6,3.8,6.9,5.8,14],[7.1,6.3,2.9,6,6.8,12.5],[6.4,6.8,1.6,5.3,6.4,11],
 [6.1,6.5,2.1,5.1,5.3,10.3],[5.9,6.4,2.4,5.7,3.4,9.5],[4.9,4.3,3.3,5.7,-0.3,7.7],[3.6,3,3.5,4.5,-1,6.3],[3.1,2.3,3.3,3.9,1.4,6.3],[3.4,3.8,3.3,4.1,1,6.2],
 [3.1,3.1,3.5,3.4,3.1,4.5],[2.8,2.7,2.9,3.2,2.7,3.7],[2.6,2.3,3.3,2.4,3.1,2.7],[2.6,2.4,3.4,2.4,2.6,3],[2.7,2.8,3.8,2.6,2.7,2.8],[2.6,2.5,3.6,2.5,3.4,2.9],
 [2.8,2.6,2.9,2.7,3.5,4],[2.4,2,2.4,2.2,3.3,4],[2.1,1.8,1.7,1.4,3.3,4.2],[2.3,2.4,1.8,1.6,3.3,4.2],[2.5,2.4,2.4,1.7,3.8,3.9],[2.7,2.8,2.8,1.8,3.9,3.9],
 [2.8,2.8,2.9,1.8,3,4.3],[2.7,2.6,2.9,0.9,3.5,4.3],[2.5,2.3,2.2,0.9,3.4,4.4],[2.4,2.2,2.2,0.9,4.1,3.7],[2.2,2.1,2,0.6,2.9,3.5],[2.3,2,2.3,0.9,2.7,3.4],
 [2.4,1.8,2.7,0.9,2.5,2.9],[2.4,2.1,2.7,0.8,2.4,2.7],[2.6,2.4,3,1.1,3,2.9],[2.5,2.3,3.2,0.8,3,2.9],[2.4,2.6,3.2,0.8,2.6,2.6],[2.3,2,3,0.7,2.7,2.5]]
assert len(H) == 36
rows = transpose(H, G, M, "HICP inflation (%)")
S = "HICP inflation (%)"
story = (f"EU inflation fell from {at(rows,'EU27',S,'2023-01')}% in January 2023 to {at(rows,'EU27',S,'2025-12')}% in December 2025. Poland went from {at(rows,'Poland',S,'2023-01')}% to {at(rows,'Poland',S,'2025-12')}%, "
         f"the Netherlands dipped to {at(rows,'Netherlands',S,'2023-10')}% in October 2023 before settling near 3%, and France ended 2025 at just {at(rows,'France',S,'2025-12')}%. Data for later months is not yet in the Eurostat table used here.")
save("eu", "inflation", "Consumer price inflation (HICP)", "% change vs year earlier", {S: "% vs year earlier"}, "Eurostat prc_hicp_manr", "https://ec.europa.eu/eurostat/databrowser/view/prc_hicp_manr/default/table?lang=en", LIC, rows, story)
