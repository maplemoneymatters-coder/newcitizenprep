# NewCitizenPrep — Vercel deployment

Static site (no build step). 

## Before you deploy — edit 2 things
1. `js/config.js` — set your **Ko-fi URL** and **contact email**.
2. Replace `https://newcitizenprep.ca` with your real domain in `sitemap.xml` and `robots.txt`
   (canonical tags in each page also use it: search & replace across the `.html` files).

## Deploy
- **Drag & drop:** vercel.com/new → upload this folder, or
- **CLI:** `npm i -g vercel` then run `vercel --prod` inside this folder.
- **Git:** push to GitHub, import the repo in Vercel. Framework preset: "Other". No build command, output directory = root.

## Add more questions
Append rows to `js/questions.js`: `["Topic","Question",["A","B","C","D"],correctIndex,"Explanation"],`
New topics appear automatically in the exam. (Home/topics page counts are static HTML — update them if you add a new topic.)
