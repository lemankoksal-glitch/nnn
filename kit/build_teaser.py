"""The Night Edit — Gmail teaser email.

The Gmail connector strips every <img>, <style>, class and CSS background image,
so the full illustrated edition lives on GitHub Pages and this email links to it.
Only what survives the connector is used: bgcolor + background-color, inline styles,
border-radius pills, web-safe fonts, normal links and mailto links.

Usage:
  python3 kit/build_teaser.py EDITION_BUILD_EMAIL_PY PAGE_URL ISSUE "DATE" "DAY" HEROHEX OUT.html ["intro text"]
  e.g. python3 kit/build_teaser.py /tmp/edition/build_email.py \
       https://lemankoksal-glitch.github.io/nnn/night-edit/2026-10-13/ 1 "13.10.2026" "Maṅgalavāra" "#e8432d" teaser.html
STORIES (n, key, h1, h2, tags, body) are read from the edition's build_email.py.
"""
import sys, re, importlib.util, urllib.parse as up

src, URL, ISSUE, DATE, DAY, HERO, OUT = sys.argv[1:8]
INTRO = sys.argv[8] if len(sys.argv) > 8 else (
    "Good evening, Rya. Three stories worth your night, the season’s signals, "
    "and a tap to steer tomorrow. The full edition is illustrated and animated, so open it on the page.")
spec = importlib.util.spec_from_file_location("ed", src); ed = importlib.util.module_from_spec(spec); spec.loader.exec_module(ed)
VOTE = ed.VOTE_TO; S = ed.STORIES

CON = "Impact,'Arial Narrow Bold','Helvetica Neue',Arial,sans-serif"
SER = "Georgia,'Times New Roman',serif"
SAN = "'Helvetica Neue',Helvetica,Arial,sans-serif"
INK = "#111111"; CREAM = "#f3ead8"; PINK = "#ec5aa3"; NIGHT = "#1d2b6e"
STORY_COLS = ["#e8432d", "#2f8f4e", "#2350d8"]
light_hero = HERO.lower() in ("#ffffff", "#fbf7ee", "#f3ead8", "#f3e3a6", "#f2c230", "#f2b4bf", "#c6db57")
HFG = INK if light_hero else "#ffffff"

def mt(s, b=""): return f"mailto:{VOTE}?subject={up.quote(s)}" + (f"&body={up.quote(b)}" if b else "")
def btn(label, href, bg, fg, border=INK, size=14, pad="14px 22px"):
    return (f'<table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:0 8px 10px 0;"><tr>'
            f'<td bgcolor="{bg}" style="background-color:{bg};border:2px solid {border};border-radius:30px;padding:{pad};">'
            f'<a href="{href}" style="color:{fg};font-family:{SAN};font-size:{size}px;font-weight:bold;letter-spacing:1px;'
            f'text-transform:uppercase;text-decoration:none;white-space:nowrap;">{label}</a></td></tr></table>')
def row(inner, bg="#ffffff", pad="32px 32px"):
    return f'<tr><td bgcolor="{bg}" style="background-color:{bg};padding:{pad};">{inner}</td></tr>'
def small(t, col=INK, mb=10):
    return f'<p style="margin:0 0 {mb}px;font-family:{SAN};font-size:12px;line-height:18px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:{col};">{t}</p>'
def h1(t, col=INK, size=56):
    return f'<p style="margin:0;font-family:{CON};font-size:{size}px;line-height:{size}px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:{col};">{t}</p>'
def h2(t, col=INK, size=26):
    return f'<p style="margin:8px 0 0;font-family:{SER};font-style:italic;font-size:{size}px;line-height:{int(size*1.25)}px;color:{col};">‘{t}’</p>'
def p(t, col="#222222", size=16):
    return f'<p style="margin:0 0 16px;font-family:{SAN};font-size:{size}px;line-height:{int(size*1.55)}px;color:{col};">{t}</p>'
def first_sentence(html):
    txt = re.sub(r"<[^>]+>", "", html)
    m = re.match(r"(.+?[.!?])(\s|$)", txt)
    return m.group(1) if m else txt

def story(s, i):
    bg = STORY_COLS[i % 3]
    love = mt(f"Night Edit N°{ISSUE} — LOVE {s['n']} {s['key']}", f"♥ Loved story {s['n']}. (Add a note if you like.)")
    less = mt(f"Night Edit N°{ISSUE} — LESS {s['n']} {s['key']}", "Less of this kind of story.")
    o = row(small(f"{s['n']} / 0{len(S)} &nbsp;·&nbsp; " + " &nbsp; ".join("+ " + t for t in s["tags"]), "#ffffff", 12)
            + h1(s["h1"], "#ffffff", 46) + h2(s["h2"], "#ffffff"), bg, "36px 32px 32px")
    o += row(p(first_sentence(s["body"][0]))
             + f'<p style="margin:0 0 18px;font-family:{SAN};font-size:14px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">'
               f'<a href="{URL}" style="color:{INK};text-decoration:underline;">Read the story &amp; sources →</a></p>'
             + small("Did you like this story? Tap to vote", INK, 12)
             + btn("&#9829; Yes, more like this", love, INK, "#ffffff")
             + btn("&#10005; No, less like this", less, "#ffffff", INK), "#ffffff", "26px 32px 26px")
    return o

def build():
    o = row(small(f"N° {ISSUE} &nbsp;·&nbsp; {DAY.upper()} &nbsp;·&nbsp; {DATE}", HFG, 18)
            + h1("The<br>Night<br>Edit", HFG, 76)
            + f'<p style="margin:18px 0 0;font-family:{SAN};font-size:14px;font-weight:bold;letter-spacing:3px;color:{HFG};">FASHION &nbsp;·&nbsp; MATERIALS &nbsp;·&nbsp; AI</p>',
            HERO, "48px 32px 44px")
    o += row(f'<p style="margin:0 0 16px;font-family:{SER};font-style:italic;font-size:24px;line-height:31px;color:{INK};">Tonight’s edition is illustrated and animated.</p>'
             + btn("Open tonight’s edition &nbsp;→", URL, PINK, "#ffffff", PINK, 16, "18px 28px"), CREAM, "30px 32px 22px")
    heads = " &nbsp; ".join(f"<b>{s['n']}</b> {s['h1']}" for s in S)
    o += row(p(INTRO) + f'<p style="margin:0;font-family:{SAN};font-size:14px;line-height:24px;color:{INK};">{heads} &nbsp; <b>+</b> Signals</p>', "#ffffff", "30px 32px 26px")
    for i, s in enumerate(S): o += story(s, i)
    o += row(h1("Signals", INK, 40) + h2("Colour, cloth &amp; desire", INK, 22)
             + '<div style="height:14px;line-height:14px;">&nbsp;</div>'
             + p("The season’s colours with their planets’ gems, the fabric trends and the month’s most-wanted pieces are in the full edition.", INK, 15)
             + btn("See the signals →", URL, INK, "#ffffff"), "#f2c230", "36px 32px 26px")
    ch = [("Runway", "Night Edit — MORE runway & shows"), ("Fabrics", "Night Edit — MORE fabrics & materials"),
          ("AI", "Night Edit — MORE AI & tech"), ("Colour", "Night Edit — MORE colour & style"),
          ("Best-sellers", "Night Edit — MORE shopping & best-sellers")]
    o += row(f'<p style="margin:0 0 6px;font-family:{SER};font-style:italic;font-size:26px;line-height:32px;color:#ffffff;">Tomorrow, show me more of:</p>'
             f'<p style="margin:0 0 18px;font-family:{SAN};font-size:14px;line-height:22px;color:#dddddd;">Tap one. Your mail app opens with the vote filled in. Just press send.</p>'
             + "".join(btn("+ " + l, mt(sj), "#ffffff", INK, "#ffffff") for l, sj in ch)
             + f'<p style="margin:10px 0 0;font-family:{SAN};font-size:14px;color:#ffffff;">Or <a href="{mt("Night Edit — a note from Rya")}" style="color:#ffffff;text-decoration:underline;">write me a note</a>.</p>',
             INK, "36px 32px 30px")
    o += row(f'<p style="margin:0;font-family:{SER};font-style:italic;font-size:30px;line-height:36px;color:{CREAM};">Sleep well, Rya ☾</p>'
             f'<p style="margin:12px 0 0;font-family:{SAN};font-size:11px;font-weight:bold;letter-spacing:2px;color:{CREAM};">THE NIGHT EDIT · EVERY NIGHT 23:00 DUBAI</p>', NIGHT, "34px 32px")
    pre = " · ".join(s["h1"] for s in S)
    return (f'<div style="display:none;max-height:0;overflow:hidden;">{pre}. Open tonight’s illustrated edition.</div>'
            f'<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background-color:#ffffff;"><tr><td align="center" style="padding:0;">'
            f'<table width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">{o}</table></td></tr></table>')

h = re.sub(r">\s+<", "><", build())
open(OUT, "w").write(h)
print(len(h), "bytes ->", OUT)
