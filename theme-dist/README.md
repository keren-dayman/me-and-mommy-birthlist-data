theme-dist/ — קבצי התמה של כלי רשימת הלידה, כפי שהועלו לחנות Shopify.
נבנים ב-repo המנוע (`theme/build_theme.py` מ-`ui/birthlist.html`). Shopify מושכת אותם מכאן בכתובת raw לפי sha של קומיט בזמן ההעלאה (`themeFilesUpsert`, `body.type = URL`). לא לערוך ידנית.
`templates/page.birthlist.json` הועלה פעם אחת (שלב F) ולא מועלה מחדש — שופיפיי שומרת בו את ההגדרות והבלוקים מהעורך.
