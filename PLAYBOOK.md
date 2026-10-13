# The Night Edit — nightly playbook

Nightly fashion email for Rya (ryatmiri@gmail.com), sent from Leman's Gmail (lemankoksal@gmail.com) at 23:00 Dubai.
Reference edition: `kit/reference-edition-N0.html` (N° 0, 12 Oct 2026). Every edition copies its layout, type, tone and section order exactly.

## Content (every night)
- **3 stories**, the most interesting fashion news of the last 24–48 h, each from a different area: latest shows/runway, material & fabric innovation, style innovation, most innovative brand moves, new techniques in AI. Pick the 3 strongest and most varied, weighted by Rya's votes.
- Each story: condensed one-word title, quoted serif subtitle, 3 "+ tags", 2 short paragraphs, "Sources →" with 1–3 real links (always link the actual articles), the vote buttons, a full-width illustration, and a black "Why it matters" panel.
- **Signals**: colour trend (with the Vedic planet/gem pairing), fabric trend, most-wanted/best-selling products of the month. Each with a source link. Refresh only when there's new data; otherwise rotate in a fresh angle.
- Plain, warm English. Verify every fact against its source. Never invent news.

## Vedic theme
Each night takes its ruling planet: Sun Surya/ruby/red · Mon Chandra/pearl/white · Tue Mangala/red coral · Wed Budha/emerald/green · Thu Guru/yellow sapphire · Fri Shukra/diamond/pink · Sat Shani/blue sapphire. Put the Sanskrit day name in the intro subtitle (Ravivāra, Somavāra, Maṅgalavāra, Budhavāra, Guruvāra, Śukravāra, Śanivāra), and let the hero's background colour follow that planet.

## Learning from votes
Votes arrive in Leman's Gmail as emails with subjects like "Night Edit N°x — LOVE 02 …", "… LESS 01 …", "Night Edit — MORE fabrics & materials", or "Night Edit — a note from Rya".
1. Search Gmail for `subject:"Night Edit" newer_than:2d` and read each one.
2. Update `prefs.json` in this branch: per-topic score (+2 LOVE, −2 LESS, +3 MORE), plus Rya's notes verbatim. Commit it.
3. Use the scores to choose tomorrow's stories and angles.

## Illustrations (style is fixed)
Use Figma `generate_image`, model `gpt-image-2.5-sunburst` (OpenAI), plan `team::1110441019899694250`, 1536×1024. Every prompt starts with:
"Contemporary graphic illustration in a mid-century modernist, Bauhaus-inspired, paper-cut style: flat geometric shapes, bold flat colour, no gradients, no outlines, subtle risograph print grain, generous negative space, figures well separated." Then a single solid background colour, then the scene. End with: "Witty, elegant, gallery-poster quality. No text, no letters, no logos."
Make 6 images: hero (two figures, empty upper-middle for the title), 3 stories, and 2 for Signals. Reuse `night-edit/2026-10-12/moon.gif` as the closing image.

## Animate (needs Leman's Mac)
1. In the built-in browser, fetch each Figma image URL and save it to ~/Downloads as `ne_YYYYMMDD_<name>.png` (one download every 3 s).
2. Stage the files with device_stage_files.
3. Edit the SCENES coordinates in `kit/animate.py` to match each new picture (authored in 1200×800 space: bob the figures, rotate fans or wheels, drift smoke). Point SRC at the new files and run it. The hero gets the title automatically.
4. Commit the GIFs to `night-edit/YYYY-MM-DD/` on this branch and push. Image URL: `https://cdn.jsdelivr.net/gh/lemankoksal-glitch/nnn@<commit>/night-edit/YYYY-MM-DD/<name>.gif` (always pin the commit hash).
**If the Mac is unreachable**, skip the animation and use the Figma PNG URLs directly. They stay public for 7 days, which is fine for a nightly email.

## Build, publish & send
The Gmail connector deletes every image (any `<img>`, CSS background image, `background` attribute, svg), every `<style>` block and every class. So **never send the full edition HTML through Gmail.** The full design lives on a web page (GitHub Pages), and the email is a styled teaser that links to it.

1. **Full edition page.** Copy `kit/build_email.py` to `/home/claude/ed/build_email.py`, then replace STORIES, the signals text, the intro, IMG, the issue number (every "N°0" / "N° 0") and the date. Mailto votes go to lemankoksal@gmail.com with the subjects above. Run `python3 /home/claude/ed/build_email.py night-edit/YYYY-MM-DD/index.html`.
2. Commit and push. The page goes live at `https://lemankoksal-glitch.github.io/nnn/night-edit/YYYY-MM-DD/` within about a minute. Check it with WebFetch: it should return the edition's headlines, not a 404. If it's still 404 after about 5 minutes, check that `night-edit/2026-10-12/` loads. If that one fails too, Pages is off: email Leman instead of Rya.
3. **Teaser email.** Run `python3 kit/build_teaser.py /home/claude/ed/build_email.py <page URL> <issue> "DD.MM.YYYY" "<Sanskrit day>" "<planet hex>" teaser.html "<intro text>"`. Its intro uses the same tone as the page intro, and the hero colour follows the night's planet.
4. Send `teaser.html` as `htmlBody` with `mcp__Gmail__send_message` to ryatmiri@gmail.com, bcc lemankoksal@gmail.com. Subject: "The Night Edit · N° <n> — <story 1 headline>". Include a short plain-text `body` with the page link too.
5. Increment the issue number in `prefs.json`, then commit and push.
