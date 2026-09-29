#!/usr/bin/env python3
"""把 projects.json ＋ shots.mjs 截的圖，產成 3D 場景要的素材：

  static/models/projects/<id>/slideA-D.webp   投影片，1024x512
  static/models/projects/<id>/floorTexture.webp  地板上的文字，2048x1024，黑底白字（當遮罩用）

用法：
  node tools/shots.mjs /tmp/shots
  python3 tools/make_projects.py /tmp/shots
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONT = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"   # 繁中用 index 3（TC）
FONT_REG = "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"


def font(size, bold=True):
    return ImageFont.truetype(FONT if bold else FONT_REG, size, index=3)


def slide(src, dst):
    im = Image.open(src).convert("RGB")
    im = im.resize((1024, int(im.height * 1024 / im.width)))
    im.crop((0, 0, 1024, 512)).save(dst, "WEBP", quality=82)


def phone_slide(src, dst):
    """手機截圖直的，放在深色底的正中間。"""
    bg = Image.new("RGB", (1024, 512), (18, 18, 22))
    im = Image.open(src).convert("RGB")
    im.thumbnail((1024, 472))
    bg.paste(im, ((1024 - im.width) // 2, 20))
    bg.save(dst, "WEBP", quality=82)


def wrap(draw, text, f, width):
    lines, line = [], ""
    for ch in text:
        if draw.textlength(line + ch, font=f) > width:
            lines.append(line); line = ch
        else:
            line += ch
    return lines + [line] if line else lines


def floor(p, dst):
    """版面照原作：左邊標題＋說明，中間「類型」「用了」，白字黑底。"""
    im = Image.new("RGB", (2048, 1024), "black")
    d = ImageDraw.Draw(im)
    d.text((0, -10), p["title"], font=font(96), fill="white")
    y = 150
    for line in wrap(d, p["desc"], font(52, False), 880):
        d.text((0, y), line, font=font(52, False), fill="white"); y += 74

    def tag(x, y, label):
        f = font(34)
        w = d.textlength(label, font=f)
        d.rectangle((x, y + 4, x + w + 16, y + 50), fill="white")
        d.text((x + 8, y + 2), label, font=f, fill="black")

    tag(960, 160, "類型")
    d.text((960, 220), p["role"], font=font(52, False), fill="white")
    tag(960, 330, "用了")
    for k, part in enumerate(p["with"].split("、")):
        d.text((960, 390 + k * 70), part, font=font(52, False), fill="white")
    im.save(dst, "WEBP", quality=90)


def main(shots):
    for p in json.loads((ROOT / "tools" / "projects.json").read_text(encoding="utf-8")):
        out = ROOT / "static" / "models" / "projects" / p["id"]
        out.mkdir(parents=True, exist_ok=True)
        for k in "ABC":
            slide(Path(shots) / f"{p['id']}{k}.png", out / f"slide{k}.webp")
        phone_slide(Path(shots) / f"{p['id']}D.png", out / "slideD.webp")
        floor(p, out / "floorTexture.webp")
        print("ok", p["id"])


if __name__ == "__main__":
    main(sys.argv[1])
