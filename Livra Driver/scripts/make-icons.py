"""
Generates the Livra Driver app icon set.
Brand: deep blue background (#2563eb) + white "L" with a delivery van glyph.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path(__file__).parent.parent / "assets"
BLUE = (37, 99, 235)        # #2563eb
WHITE = (255, 255, 255)
WHITE_60 = (255, 255, 255, 153)


def find_bold_font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf",      # Segoe UI Bold
        "C:/Windows/Fonts/arialbd.ttf",       # Arial Bold
        "C:/Windows/Fonts/calibrib.ttf",      # Calibri Bold
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def make_icon(size: int, bg: tuple, with_corners: bool, save_to: Path):
    img = Image.new("RGBA", (size, size), bg + (255,) if len(bg) == 3 else bg)
    draw = ImageDraw.Draw(img)

    # Round the corners for the main app icon (Android/iOS apply masks too,
    # but a soft rounded square reads cleanly when displayed flat).
    if with_corners:
        radius = size // 5
        mask = Image.new("L", (size, size), 0)
        mdraw = ImageDraw.Draw(mask)
        mdraw.rounded_rectangle((0, 0, size, size), radius=radius, fill=255)
        img.putalpha(mask)

    # Draw the "L" — large, bold, slightly inset toward bottom-left
    font_size = int(size * 0.62)
    font = find_bold_font(font_size)
    text = "L"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - text_w) // 2 - bbox[0]
    y = (size - text_h) // 2 - bbox[1] - int(size * 0.03)  # nudge up slightly
    draw.text((x, y), text, fill=WHITE, font=font)

    # Tiny accent: small circle in upper right (suggests a destination pin)
    pin_r = max(4, size // 22)
    pin_cx = size - int(size * 0.22)
    pin_cy = int(size * 0.22)
    draw.ellipse(
        (pin_cx - pin_r, pin_cy - pin_r, pin_cx + pin_r, pin_cy + pin_r),
        fill=WHITE,
    )

    img.save(save_to, "PNG")
    print(f"  wrote {save_to.name} ({size}x{size})")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    print("Generating Livra Driver icons...")

    # Main app icon — 1024x1024 with rounded corners (Expo expects 1024x1024)
    make_icon(1024, BLUE, with_corners=True, save_to=OUT / "icon.png")

    # Adaptive icon foreground — Android. The blue background is set in
    # app.json's android.adaptiveIcon.backgroundColor; this layer is just
    # the white L on transparent.
    fg = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    fdraw = ImageDraw.Draw(fg)
    font = find_bold_font(int(1024 * 0.62))
    bbox = fdraw.textbbox((0, 0), "L", font=font)
    text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    fx = (1024 - text_w) // 2 - bbox[0]
    fy = (1024 - text_h) // 2 - bbox[1] - int(1024 * 0.03)
    fdraw.text((fx, fy), "L", fill=WHITE, font=font)
    fg.save(OUT / "adaptive-icon.png", "PNG")
    print(f"  wrote adaptive-icon.png (1024x1024 transparent)")

    # Splash screen — solid blue with centered "Livra" wordmark
    splash = Image.new("RGBA", (1284, 2778), BLUE + (255,))
    sdraw = ImageDraw.Draw(splash)
    sfont = find_bold_font(180)
    text = "Livra"
    sbbox = sdraw.textbbox((0, 0), text, font=sfont)
    sw, sh = sbbox[2] - sbbox[0], sbbox[3] - sbbox[1]
    sx = (1284 - sw) // 2 - sbbox[0]
    sy = (2778 - sh) // 2 - sbbox[1]
    sdraw.text((sx, sy), text, fill=WHITE, font=sfont)
    # Subtitle
    subfont = find_bold_font(56)
    subtext = "Driver"
    sub_bbox = sdraw.textbbox((0, 0), subtext, font=subfont)
    sub_w = sub_bbox[2] - sub_bbox[0]
    sub_x = (1284 - sub_w) // 2 - sub_bbox[0]
    sub_y = sy + sh + 24
    sdraw.text((sub_x, sub_y), subtext, fill=(191, 219, 254), font=subfont)
    splash.save(OUT / "splash.png", "PNG")
    print(f"  wrote splash.png (1284x2778)")

    # Favicon — 48x48 small version for web/PWA. Same icon, smaller.
    make_icon(48, BLUE, with_corners=True, save_to=OUT / "favicon.png")

    print("Done.")


if __name__ == "__main__":
    main()
