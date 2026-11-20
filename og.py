#!/usr/bin/env python3
"""Рисует картинки для превью маршрутов (og:image, 1200x630): og/<язык>/<страница>.jpg.
Список берётся из og/manifest.json (его пишет build.js). Уже нарисованные и не изменившиеся пропускаются.
Нужен Pillow (pip install pillow). Запуск: python3 og.py   (в GitHub Actions его вызывает rebuild.yml)
Дизайн меняется здесь: после правки файла og.py все картинки перерисуются сами."""
import hashlib, json, math, os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, S = 1200, 630, 2  # S: рисуем в 2x и уменьшаем, чтобы края были гладкими
HERE = os.path.dirname(os.path.abspath(__file__))
BOLD, MED = os.path.join(HERE, "og/fonts/Inter-ExtraBold.otf"), os.path.join(HERE, "og/fonts/Inter-Medium.otf")
YEL, WHITE, LAV = (255, 210, 63), (255, 255, 255), (196, 201, 245)
SUB = {"ru": "Расписание и пересадки поездов", "uk": "Розклад і пересадки потягів",
       "en": "Train schedules and transfers", "pl": "Rozkład i przesiadki pociągów"}
_fc = {}
def font(path, size):
    k = (path, size)
    if k not in _fc: _fc[k] = ImageFont.truetype(path, int(size * S))
    return _fc[k]

def background():
    img = Image.new("RGB", (W * S, H * S))
    d = ImageDraw.Draw(img)
    top, bot = (11, 13, 72), (24, 28, 112)
    for y in range(H * S):
        t = y / (H * S - 1)
        d.line([(0, y), (W * S, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    glow = Image.new("RGB", img.size, (0, 0, 0))
    g = ImageDraw.Draw(glow)
    g.ellipse([(W * 0.55) * S, (-0.35 * H) * S, (W * 1.25) * S, (0.65 * H) * S], fill=(70, 74, 200))
    g.ellipse([(-0.3 * W) * S, (0.55 * H) * S, (0.45 * W) * S, (1.35 * H) * S], fill=(40, 46, 160))
    glow = glow.filter(ImageFilter.GaussianBlur(110 * S))
    return Image.blend(img, Image.composite(glow, img, Image.new("L", img.size, 255)), 0.55)

def logo(d, x, y):
    r = 36
    d.ellipse([(x) * S, (y) * S, (x + 2 * r) * S, (y + 2 * r) * S], fill=YEL)
    ink, k, ox, oy = (58, 47, 0), 2.1, x + r - 12 * 2.1 * 0.5 * 2 / 2, y + r - 12 * 2.1 * 0.5 * 2 / 2
    cx, cy, u = x + r, y + r, 2.0  # иконка поезда 24x24 как в шапке сайта, центр в кружке
    def P(a, b): return ((cx + (a - 12) * u) * S, (cy + (b - 12) * u) * S)
    d.rounded_rectangle([P(5, 3), P(19, 17)], radius=3 * u * S, outline=ink, width=int(2 * u * S * 0.9))
    d.line([P(5, 11), P(19, 11)], fill=ink, width=int(2 * u * S * 0.9))
    for a in (9, 15): d.ellipse([P(a - .9, 14 - .9), P(a + .9, 14 + .9)], fill=ink)
    d.line([P(8, 21), P(10, 17)], fill=ink, width=int(2 * u * S * 0.9)); d.line([P(16, 21), P(14, 17)], fill=ink, width=int(2 * u * S * 0.9))

def spaced(d, xy, text, f, fill, gap):
    x, y = xy
    for ch in text:
        d.text((x * S, y * S), ch, font=f, fill=fill)
        x += f.getlength(ch) / S + gap

def headline(d, a, b, maxw):
    """«A → B» крупно; если не влезает — уменьшаем, потом переносим на две строки"""
    arrow = "→"
    for size in range(96, 55, -4):
        f = font(BOLD, size)
        wa, wb, wr = f.getlength(a) / S, f.getlength(b) / S, f.getlength(" " + arrow + " ") / S
        if wa + wr + wb <= maxw:
            x, y = 70, 190 + (96 - size) * 0.25
            d.text((x * S, y * S), a, font=f, fill=WHITE)
            d.text(((x + wa) * S, y * S), " " + arrow + " ", font=f, fill=YEL)
            d.text(((x + wa + wr) * S, y * S), b, font=f, fill=WHITE)
            return y + size * 1.25
    size = 64
    while size > 36 and max(font(BOLD, size).getlength(a), font(BOLD, size).getlength(b)) / S + 60 > maxw: size -= 4
    f = font(BOLD, size)
    d.text((70 * S, 170 * S), a, font=f, fill=WHITE)
    d.text((70 * S, (170 + size * 1.2) * S), arrow + " ", font=f, fill=YEL)
    d.text(((70 + f.getlength(arrow + " ") / S) * S, (170 + size * 1.2) * S), b, font=f, fill=WHITE)
    return 170 + size * 2.4

def route_arc(d, a, b):
    x0, y0, x1, y1, cy = 110, 520, 1090, 520, 380
    n = 62
    for i in range(1, n):
        t = i / n
        x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2) + t ** 2 * x1
        y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1
        r = 3.2 + 1.2 * math.sin(math.pi * t)
        d.ellipse([(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S], fill=(255, 255, 255, 170))
    # начало: кольца; конец: метка
    for r, w in ((26, 5), (11, 5)): d.ellipse([(x0 - r) * S, (y0 - r) * S, (x0 + r) * S, (y0 + r) * S], outline=YEL, width=w * S)
    d.ellipse([(x0 - 4) * S, (y0 - 4) * S, (x0 + 4) * S, (y0 + 4) * S], fill=YEL)
    d.polygon([((x1 - 20) * S, (y1 - 6) * S), ((x1 + 20) * S, (y1 - 6) * S), (x1 * S, (y1 + 34) * S)], fill=YEL)
    d.ellipse([(x1 - 24) * S, (y1 - 42) * S, (x1 + 24) * S, (y1 + 6) * S], fill=YEL)
    d.ellipse([(x1 - 9) * S, (y1 - 27) * S, (x1 + 9) * S, (y1 - 9) * S], fill=(24, 28, 112))
    f = font(BOLD, 30)
    ta, tb = a.upper(), b.upper()
    while f.getlength(ta) / S > 430 or f.getlength(tb) / S > 430: f = ImageFont.truetype(BOLD, int(f.size - 2))
    d.text((70 * S, 570 * S), ta, font=f, fill=YEL)
    d.text(((1130 - f.getlength(tb) / S) * S, 570 * S), tb, font=f, fill=YEL)

def render(l, a, b, out):
    img = background().convert("RGBA")
    ov = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    logo(d, 70, 38)
    spaced(d, (160, 52), "КОЛІЯ", font(BOLD, 40), WHITE, 4)
    bottom = headline(d, a, b, 1060)
    d.text((70 * S, bottom * S), SUB.get(l, SUB["ru"]), font=font(MED, 34), fill=LAV)
    route_arc(d, a, b)
    img = Image.alpha_composite(img, ov).convert("RGB").resize((W, H), Image.LANCZOS)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img.save(out, "JPEG", quality=84, optimize=True, subsampling=2)

def main():
    mf = os.path.join(HERE, "og/manifest.json")
    if not os.path.exists(mf): sys.exit("og.py: нет og/manifest.json (запустите node build.js)")
    M = json.load(open(mf, encoding="utf8"))
    ver = hashlib.sha1(open(__file__, "rb").read()).hexdigest()[:8]
    hf = os.path.join(HERE, "og/hashes.json")
    try: H_ = json.load(open(hf))
    except Exception: H_ = {}
    new, n = {}, 0
    for m in M:
        h = hashlib.sha1(json.dumps([m["l"], m["a"], m["b"], ver], ensure_ascii=False).encode()).hexdigest()[:10]
        out = os.path.join(HERE, m["f"])
        if not (os.path.exists(out) and H_.get(m["f"]) == h):
            render(m["l"], m["a"], m["b"], out); n += 1
        new[m["f"]] = h
    keep = {os.path.join(HERE, m["f"]) for m in M}
    for l in ("ru", "uk", "en", "pl"):  # убрать картинки удалённых маршрутов
        dd = os.path.join(HERE, "og", l)
        if os.path.isdir(dd):
            for f in os.listdir(dd):
                p = os.path.join(dd, f)
                if f.endswith(".jpg") and p not in keep: os.remove(p)
    json.dump(new, open(hf, "w"), indent=1, sort_keys=True); open(hf, "a").write("\n")
    print(f"og.py: нарисовано {n}, всего {len(M)}")

if __name__ == "__main__": main()
