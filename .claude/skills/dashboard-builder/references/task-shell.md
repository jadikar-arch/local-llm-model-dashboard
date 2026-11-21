# SHELL task (page skeleton for one country)
1. Read `references/shell-template.html` and `references/app-template.js`.
2. Create `site/<c>/index.html` from the template: replace COUNTRY_NAME and the three `topics/<topic>.js` script tags with the 3 topic ids from tasks.md (data files `site/data/<c>/*.json` tell you the ids: `ls site/data/<c>`). The script tags may point to topic files that do not exist yet only if you create an empty placeholder file for each (`topics/<id>.js` containing a comment) so there are no 404s.
3. Create `site/<c>/app.js` from the template: set `country`, a crisp headline, a one-sentence subtitle, and the 3 `topic(id, title)` entries.
4. Check: `node --check site/<c>/app.js`, then `node scripts/qa.mjs <c>` (tabs and loading must work; chart checks may fail until topics exist, that is expected).
