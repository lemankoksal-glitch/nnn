"""The Night Edit — layout mirrors Scholar's 'Hermazing' project page.
Type: Anton (≈Druk XCondensed), Fraunces Light WONK (≈Tan Waverly), Unbounded (≈Stretch Pro), Hanken Grotesk (≈commuters-sans)."""
import urllib.parse as up

VOTE_TO = "lemankoksal@gmail.com"
BASE="https://cdn.jsdelivr.net/gh/lemankoksal-glitch/nnn@0525804/night-edit/2026-10-12/"
IMG = {k: BASE+k+".gif" for k in ["hero","runway","thread","ai","palette","fabric","wanted","moon"]}
K = "#000000"
DRUK  = "'Anton','Druk XCondensed Super','Impact','Haettenschweiler','AvenirNextCondensed-Heavy','Arial Narrow',sans-serif"
TAN   = "'Fraunces','Tan Waverly','Didot','Bodoni 72',Georgia,serif"
WIDE  = "'Unbounded','Stretch Pro','Arial Black','Helvetica Neue',Arial,sans-serif"
BODY  = "'Hanken Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif"
TANVAR = "font-variation-settings:'opsz' 144,'SOFT' 0,'WONK' 1;"

def mailto(s, b=""):
    return f"mailto:{VOTE_TO}?subject={up.quote(s)}" + (f"&body={up.quote(b)}" if b else "")

def full(k, alt):   # full-bleed image row
    return f'<tr><td style="padding:0;line-height:0;font-size:0;"><img src="{IMG[k]}" width="600" alt="{alt}" style="display:block;width:100%;height:auto;border:0;"></td></tr>'

def tag(text, href=None):
    inner = f'<span style="font-size:13px;line-height:18px;">+</span> {text}'
    a = f'<a href="{href}" style="color:{K};text-decoration:none;">{inner}</a>' if href else inner
    return f'<div style="font-family:{WIDE};font-weight:600;font-size:10px;line-height:18px;letter-spacing:.6px;text-transform:uppercase;color:{K};margin:0 0 4px;">{a}</div>'

def credit(label, value, href=None):
    v = f'<a href="{href}" style="color:{K};text-decoration:underline;text-underline-offset:2px;">{value}</a>' if href else value
    return (f'<p style="margin:0 0 14px;font-family:{BODY};font-size:13px;line-height:17px;color:{K};">'
            f'<strong style="font-family:{WIDE};font-weight:700;font-size:10.5px;line-height:15px;letter-spacing:.2px;">{label}</strong><br>{v}</p>')

def heading_arrow(text):
    return f'<div style="font-family:{TAN};{TANVAR}font-weight:300;font-size:27px;line-height:34px;color:{K};margin:22px 0 14px;">{text} <span style="font-family:{BODY};font-weight:300;font-size:20px;">→</span></div>'

def para(t):
    return f'<p style="margin:0 0 14px;font-family:{BODY};font-size:13.5px;line-height:20px;color:{K};">{t}</p>'

def section(h1, h2, tags, right, top=56):
    """Two-column block: left = condensed title + quoted serif title + '+' tags; right = text / credits."""
    return f"""
<tr><td class="px" style="padding:{top}px 36px 52px;">
 <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
  <td class="col" valign="top" style="width:196px;padding-right:22px;">
   <div style="font-family:{DRUK};font-size:64px;line-height:62px;letter-spacing:.5px;text-transform:uppercase;color:{K};">{h1}</div>
   <div style="font-family:{TAN};{TANVAR}font-weight:300;font-size:34px;line-height:44px;letter-spacing:.5px;color:{K};margin:6px 0 34px;">‘{h2}’</div>
   {''.join(tags)}
  </td>
  <td class="col" valign="top" style="padding-top:6px;">{right}</td>
 </tr></table>
</td></tr>"""

def black(text, extra=""):
    return f"""<tr><td style="background:{K};padding:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
 <td class="pxb" style="padding:56px 48px 60px;">
  <div style="font-family:{TAN};{TANVAR}font-weight:300;font-size:25px;line-height:33px;color:#ffffff;">{text}</div>{extra}
 </td></tr></table></td></tr>"""

def grid(a, b, alt_a, alt_b):
    cell = lambda k, alt: f'<td class="g" width="50%" style="padding:0;line-height:0;font-size:0;width:50%;"><img src="{IMG[k]}" width="300" alt="{alt}" style="display:block;width:100%;height:auto;border:0;"></td>'
    return f'<tr><td style="padding:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>{cell(a,alt_a)}{cell(b,alt_b)}</tr></table></td></tr>'

# ---------------- content ----------------
STORIES = [
 dict(n="01", key="Runway lightness", h1="Runway", h2="Learning to float",
      tags=["Paris SS27","Louis Vuitton","Hermès · Dior"], img="runway",
      alt="Three geometric models float above the runway in huge striped balloon trousers",
      body=["Louis Vuitton closed Paris Fashion Week on 6 October with floating silk trousers and pared-back tailoring. Nicolas Ghesquière called the feeling “a second skin”. Hermès and Jonathan Anderson’s Dior chased the same weightlessness.",
            "The mood around it was loud, though. Minimalism is out, orange is the new colour, and Paris answered Milan’s “season of the skirt” with party pants: skirted silk slacks at Vuitton, sparkly snakeskin jeans at Balmain."],
      src=[("Wallpaper*","The best shows of PFW S/S 2027","https://www.wallpaper.com/fashion-beauty/best-collections-from-paris-fashion-week-s-s-2027"),
           ("W Magazine","9 things we saw and loved","https://www.wmagazine.com/fashion/paris-fashion-week-spring-2027-recap"),
           ("The Zoe Report","Paris SS27 trends","https://www.thezoereport.com/fashion/paris-fashion-weeks-spring-summer-2027-trends")],
      why="Why it matters: expect fluid fabrics and evening trousers to take the place of the black-tie gown next spring."),
 dict(n="02", key="Textile-to-textile", h1="Materials", h2="Old into new",
      tags=["Munich","13–14 October","Textile-to-textile"], img="thread",
      alt="Old shirts tumble into a striped machine and come out as new spools of thread",
      body=["Performance Days, the fabric fair where sportswear and fashion brands source next season’s materials, opens in Munich tomorrow. Its headline theme is textile-to-textile: turning worn clothes back into new fibre instead of relying on recycled plastic bottles, with a Wool Forum alongside.",
            "FashionUnited counts 520 textile-to-textile recyclers worldwide. Next stop: Tex+Vision in Seoul, 21–23 October, with bio-based fibres, vegan leather and smart fabrics."],
      src=[("textile network","Performance Days, focus topic T2T","https://textile-network.com/en/Fashion/Trends/Performance-Days-to-exhibit-in-Brussels"),
           ("FashionUnited","2026 fabric & materials outlook","https://fashionunited.uk/news/business/5-2026-fabric-and-materials-outlook/2025120485195"),
           ("J-messe","Tex+Vision, Seoul","https://www.jetro.go.jp/en/database/j-messe/tradefair/detail/159528")],
      why="Why it matters: the fabric you buy in two years may be made from the clothes you throw out this year."),
 dict(n="03", key="AI and design rights", h1="AI", h2="A shield for designers",
      tags=["Paris","IPFC","Design rights"], img="ai",
      alt="A designer draws a dress while a pixel robot dissolves beside a big yellow copyright sign",
      body=["Fashion entrepreneur Thomas Cohen, formerly of Bonton and Merci, is launching IPFC with musician Emmanuel Lipszyc. It is modelled on France’s music-rights society and aims to help brands and creators protect their work from generative AI systems.",
            "It lands as the big groups move deeper into AI: L’Oréal has announced an alliance with OpenAI, and Kering’s CEO Luca de Meo has named innovation a pillar of the group’s transformation."],
      src=[("FashionNetwork","Innovation headlines","https://nl.fashionnetwork.com/en-nl/news/type/innovations")],
      why="Why it matters: who owns a silhouette once a model has learned it is becoming fashion’s next big legal question."),
]

def vote_row(love, less):
    b = lambda label, href, bg, fg: (f'<td style="padding:0 8px 8px 0;"><a href="{href}" style="display:inline-block;background:{bg};color:{fg};font-family:{WIDE};font-weight:700;font-size:12px;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:15px 22px;border:2px solid {K};border-radius:999px;">{label}</a></td>')
    return (f'<tr><td class="px" style="padding:0 36px 52px;">'
            f'<div style="font-family:{WIDE};font-weight:600;font-size:10px;letter-spacing:.6px;text-transform:uppercase;color:{K};margin-bottom:12px;">Did you like this story? Tap one to vote</div>'
            f'<table role="presentation" cellpadding="0" cellspacing="0"><tr>{b("&#9829;&nbsp; Yes, more like this", love, K, "#ffffff")}{b("&#10005;&nbsp; No, less like this", less, "#ffffff", K)}</tr></table>'
            f'<div style="font-family:{BODY};font-size:12px;color:#555;margin-top:6px;">Your mail app opens with the vote filled in. Just press send.</div></td></tr>')

def story(s):
    love = mailto(f"Night Edit N°0 — LOVE {s['n']} {s['key']}", f"♥ Loved story {s['n']}. (Add a note if you like.)")
    less = mailto(f"Night Edit N°0 — LESS {s['n']} {s['key']}", "Less of this kind of story.")
    tags = [tag(t) for t in s["tags"]]
    right = "".join(para(t) for t in s["body"]) + heading_arrow("Sources") + "".join(credit(a, b, u) for a, b, u in s["src"])
    return (f'<tr><td class="px" style="padding:52px 36px 0;font-family:{WIDE};font-weight:600;font-size:10px;letter-spacing:.6px;color:{K};">{s["n"]} / 03</td></tr>'
            + section(s["h1"], s["h2"], tags, right, top=10).replace('padding:10px 36px 52px;','padding:10px 36px 28px;')
            + vote_row(love, less)
            + full(s["img"], s["alt"])
            + black(s["why"]))

def build():
    intro_right = (para("Good evening, Rya. Tonight belongs to Chandra, the Moon, so the edit wears pearl, and our antelope, the Moon’s own animal in Vedic myth, leads the way. Three stories worth your night, the season’s signals, and a tap to steer tomorrow. Every night the edit learns from your votes.")
                   + heading_arrow("Tonight")
                   + credit("01 Runway", "Paris learns to float")
                   + credit("02 Materials", "Old clothes in, new thread out")
                   + credit("03 AI", "Designers raise a shield")
                   + credit("Signals", "Colour, cloth &amp; desire"))
    intro = section("Night Edit", "Somavāra", [tag("Fashion"), tag("Materials"), tag("AI")], intro_right)

    colours = [("Dragon Fire","Surya · Ruby"),("Princess Blue","Shani · Blue sapphire"),("Anise Flower ★ tonight","Chandra · Pearl"),
               ("Rosy Future","Shukra · Diamond"),("Daiquiri Green","Budha · Emerald")]
    sig_right = (para("Beige is over. Pantone’s top colours from the SS27 New York shows mix loud and quiet tones. Here each is paired with its planet’s gemstone; tonight’s match is Anise Flower, the pale yellow of Chandra’s pearl.")
                 + heading_arrow("Colour") + "".join(credit(a, b) for a, b in colours)
                 + credit("Source", "FashionUnited · Pantone", "https://fashionunited.uk/news/fashion/pantone-nyfw-spring-summer-2027-color-trend-report-the-top-10-colors/2026092190442"))
    signals = section("Signals", "Colour, cloth &amp; desire", [tag("Colour"), tag("Fabric"), tag("Most wanted")], sig_right)

    two_col_credits = f"""
<tr><td class="px" style="padding:44px 36px 48px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
 <td class="col" valign="top" style="width:50%;padding-right:18px;">
  {heading_arrow("Fabric")}
  {credit("Luminous sheers","for lightness &amp; movement")}
  {credit("Iridescent jersey","knits that catch the light")}
  {credit("Linen terry &amp; seersucker","breathable naturals lead")}
  {credit("Macramé &amp; lace","craft textures return")}
  {credit("Source","FashionUnited · Milano Unica","https://fashionunited.uk/news/fashion/spring-summer-2027-trends-seen-at-milano-unica/2026012785956")}
 </td>
 <td class="col" valign="top" style="width:50%;">
  {heading_arrow("Most wanted")}
  {credit("1","New York Knicks cap")}
  {credit("2","Issey Miyake Madame-T stole")}
  {credit("3","Skims jelly shoes")}
  {credit("Hottest brand","Chanel, then Miu Miu and Dior")}
  {credit("Source","The Lyst Index","https://www.lyst.com/the-lyst-index/Q2-26")}
 </td>
</tr></table></td></tr>"""

    choices=[("Runway &amp; shows","Night Edit — MORE runway & shows"),("Fabrics &amp; materials","Night Edit — MORE fabrics & materials"),
             ("AI &amp; tech","Night Edit — MORE AI & tech"),("Colour &amp; style","Night Edit — MORE colour & style"),
             ("Best-sellers","Night Edit — MORE shopping & best-sellers")]
    votes = "".join(f'<a href="{mailto(sub)}" style="display:inline-block;margin:0 8px 10px 0;background:#ffffff;color:{K};font-family:{WIDE};font-weight:700;font-size:11px;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:13px 18px;border-radius:999px;">+ {lab}</a>' for lab, sub in choices)
    votes = (f'<div style="font-family:{WIDE};font-weight:600;font-size:10px;letter-spacing:.6px;text-transform:uppercase;color:#ffffff;margin-bottom:14px;">Tomorrow, show me more of:</div>' + votes +
             f'<div style="margin-top:14px;font-family:{BODY};font-size:14px;color:#ffffff;">Or <a href="{mailto("Night Edit — a note from Rya")}" style="color:#ffffff;">write me a note</a>: a designer, a fabric, a question.</div>')
    closing = black("What should tomorrow bring? Every tap teaches the edit what you love.",
                    f'<div style="height:30px;"></div>{votes}')

    html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><title>The Night Edit · N° 0</title>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Fraunces:opsz,wght,SOFT,WONK@9..144,300,0..100,0..1&family=Hanken+Grotesk:wght@400;600&family=Unbounded:wght@600;700&display=swap" rel="stylesheet">
<style>
 a:hover {{ opacity:.6; }}
 @media (max-width:620px) {{
  .col {{ display:block !important; width:100% !important; padding-right:0 !important; }}
  .px {{ padding-left:22px !important; padding-right:22px !important; }}
  .pxb {{ padding:44px 26px !important; }}
 }}
</style></head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Paris learns to float, old clothes become new thread, and designers raise a shield against AI copycats.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;">
{full("hero","The Night Edit: Fashion, Materials, AI. A fan-hatted figure and an antelope holding the moon, on cobalt blue")}
{intro}
{''.join(story(s) for s in STORIES)}
{signals}
{grid("palette","fabric","Five figures in the season’s colours, each with a gemstone for a head","Four figures wearing the season’s fabrics: sheer, iridescent, seersucker, macramé")}
{grid("wanted","moon","Three plinths: a navy cap, a pleated yellow stole and jelly sandals","The antelope asleep on the crescent moon")}
{two_col_credits}
{closing}
{full("moon","Sleep well, Rya")}
<tr><td class="px" style="padding:22px 36px 30px;font-family:{WIDE};font-weight:600;font-size:9.5px;letter-spacing:.6px;text-transform:uppercase;color:{K};">+ The Night Edit &nbsp; + Every night 23:00 Dubai &nbsp; + Each night wears its planet’s colour</td></tr>
</table></td></tr></table>
</body></html>"""
    return html

if __name__ == "__main__":
    h = build(); open("/home/claude/night-edit/v7/night-edit-sample.html", "w").write(h); print(len(h))
