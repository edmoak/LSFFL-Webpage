# LSFFL Master Project Blueprint

**Project:** Lamad Squad Fantasy Football League Website  
**Primary platform:** MyFantasyLeague (MFL)  
**Practice league:** https://www48.myfantasyleague.com/2026/home/46007#0  
**GitHub repository:** LSFFL-Webpage  
**GitHub Pages preview:** https://edmoak.github.io/LSFFL-Webpage/  
**Last updated:** July 2026

---

## 1. Purpose

Build a custom, professional LSFFL website that preserves the league's history while continuing to use MyFantasyLeague for live fantasy-football functions.

The finished experience should feel like an official league website, not a default MFL page.

---

## 2. Source of Truth

This blueprint is the source of truth for the project.

Before changing the site structure, file names, hosting approach, or major page plan, check this document first.

If a new decision conflicts with this blueprint, update the blueprint before changing the website.

---

## 3. Hosting and Platform Plan

### MyFantasyLeague

MFL remains the actual league website and fantasy-football engine.

MFL will provide live data and league functions, including:

- Standings
- Scores
- Matchups
- Schedule
- Transactions
- Rosters
- Waivers
- Player statistics
- Playoff information
- Commissioner tools

### GitHub

GitHub is used for:

- CSS
- JavaScript
- Images
- Development and testing
- Project documentation
- Backup copies of custom code
- GitHub Pages preview

GitHub Pages is not replacing MFL as the final league host.

---

## 4. Locked File and Folder Names

Do not rename these files, folders, or paths unless Edward specifically requests it.

```text
LSFFL-Webpage/
├── index.html
├── README.md
├── css/
│   └── lsffl-theme.css
├── data/
├── docs/
├── images/
│   ├── backgrounds/
│   │   └── home-header-v2.png
│   ├── banners/
│   ├── flags/
│   ├── helmets/
│   ├── icons/
│   ├── logos/
│   │   └── lsffl-logo-v1.png
│   └── trophies/
├── js/
└── pages/
```

### Important path rules

- Keep `home-header-v2.png` as the homepage header image.
- Keep `lsffl-logo-v1.png` as the league logo.
- Keep `css/lsffl-theme.css` as the main stylesheet.
- Do not create new versioned filenames merely to force browser refreshes.
- Do not change paths during unrelated work.

---

## 5. Current Visual Direction

### Theme

- Nautical heritage
- Championship tradition
- Premium sports presentation
- Vintage maps and maritime elements
- Dark navy, antique gold, ivory, and charcoal

### Core colors

```text
Navy Dark:  #04111f
Navy:       #071a2f
Navy Light: #123755
Gold Dark:  #8f6b2f
Gold:       #c6a15b
Gold Light: #e2c88c
Ivory:      #f7f3e8
White:      #ffffff
Light Gray: #edf1f4
Steel:      #9aa6b2
Charcoal:   #101820
```

### Header status

The current header is acceptable for now.

Do not spend more time rebuilding it unless Edward specifically asks to revisit it.

---

## 6. Homepage Plan

The homepage will combine custom LSFFL content with live MFL modules.

### Current custom sections

1. Header
2. Main navigation
3. Defending Champion
4. League at a Glance
5. Feature cards
6. Our Story
7. Footer

### Planned live MFL sections

1. Current standings
2. Weekly matchups or scoreboard
3. Recent transactions
4. League calendar or upcoming events
5. Other live MFL modules as useful

### Rule

Use live MFL data whenever MFL already provides the information.

Do not build static standings, scores, transactions, schedules, or rosters unless there is no practical MFL option.

---

## 7. Navigation Plan

Current navigation:

- Home
- League
- Franchises
- History
- Hall of Fame
- Records
- Constitution

The navigation labels may be refined later, but do not restructure the navigation during unrelated tasks.

---

## 8. Static Content Plan

GitHub-hosted or custom HTML content may be used for:

- League history
- Hall of Champions
- Hall of Fame
- League records
- Constitution and rules
- Franchise profiles
- Owner profiles
- Founding story
- USS Emory S. Land and La Maddalena history
- Championship history
- League milestones
- Archived content

---

## 9. Franchise Content Plan

Each franchise page may eventually include:

- Team name
- Owner
- Division
- Establishment year
- Championships
- Playoff appearances
- Team record
- Branding board
- Primary logo
- Secondary logo
- Helmet
- Banner
- Flag
- Franchise history
- Rivalries
- Memorable seasons

Use the existing approved franchise branding assets.

Do not redesign completed franchise identities unless Edward requests it.

---

## 10. Working Method

Follow this workflow for every task:

1. Work on one specific item.
2. Give Edward one exact next step.
3. Use complete replacement files when practical.
4. Do not rename files or change paths.
5. Test the change.
6. Review the result.
7. Fix only the problem being reviewed.
8. Move forward after the change works.

### Communication rules

- Keep instructions short.
- Do not repeat the whole project plan.
- Do not remap the project during a small task.
- Do not introduce new tools unless necessary.
- Do not change completed sections without a reason.
- Explain only what Edward needs for the current step.

---

## 11. Coding Rules

- Keep HTML readable and organized.
- Keep CSS in `css/lsffl-theme.css` for now.
- Use comments to separate major CSS sections.
- Preserve existing class names unless a change is necessary.
- Avoid duplicate CSS declarations.
- Avoid partial edits when a complete replacement file is safer.
- Keep all image references relative and consistent.
- Test on GitHub Pages before moving code to MFL.

---

## 12. MFL Integration Rules

The final website must work inside the MFL environment.

Before creating custom replacements for MFL features, determine whether MFL already provides:

- A module
- A report
- A homepage component
- A live data table
- An API or export
- A custom home-page message option

Prefer styling and arranging MFL data over duplicating it manually.

---

## 13. Current Project Status

Completed:

- GitHub account and repository
- GitHub Pages
- Folder structure
- README
- Main stylesheet
- Basic homepage
- Header artwork integration
- Navigation
- Defending Champion section
- League at a Glance section
- Feature cards
- Our Story section
- Footer

In progress:

- Connecting the custom design to the MFL practice league
- Determining the best method for displaying live MFL standings and other modules

Next task:

**Begin MFL integration using the practice league, starting with the homepage layout and live MFL modules.**

---

## 14. Data That Must Be Verified Before Publishing

Do not guess these values:

- Active founding-owner count
- Season totals
- Historical win-loss records
- Points records
- Playoff appearances
- Championship matchup scores
- Owner names not already confirmed
- Division assignments
- Franchise establishment years not already confirmed

Use MFL records or Edward's approved data.

---

## 15. Permanent Project Rules

1. MFL is the final league platform.
2. GitHub is the development, asset, documentation, and preview platform.
3. Keep existing names and paths stable.
4. Use live MFL data whenever possible.
5. Complete one task before starting another.
6. Avoid repeatedly redesigning finished work.
7. Update this blueprint whenever a major permanent decision changes.
