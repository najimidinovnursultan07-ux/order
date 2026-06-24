"""Generate PWA icons for QR-Menu app."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / 'frontend' / 'public' / 'icons'
OUT.mkdir(parents=True, exist_ok=True)

BG = (28, 28, 30)
ACCENT = (0, 113, 227)


def create_icon(size: int, path: Path) -> None:
    img = Image.new('RGB', (size, size), BG)
    draw = ImageDraw.Draw(img)
    margin = size // 6
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=size // 8,
        fill=ACCENT,
    )
    try:
        font = ImageFont.truetype('arial.ttf', size // 3)
    except OSError:
        font = ImageFont.load_default()
    text = 'QR'
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((size - tw) / 2, (size - th) / 2 - size // 20), text, fill='white', font=font)
    img.save(path, 'PNG')


if __name__ == '__main__':
    create_icon(192, OUT / 'icon-192.png')
    create_icon(512, OUT / 'icon-512.png')
    print('Icons generated:', OUT)
