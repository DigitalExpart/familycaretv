"""
Generate anti-aliased rounded rectangle card PNG assets for Roku SG.
This guarantees perfect rounded corners (10-14px) and subtle borders/elevation
in the BRS Desktop Simulator and on all Roku devices.
"""
from PIL import Image, ImageDraw
import os

images_dir = r"c:\Users\Shilley Pc\FamilyCare TV Full Platform Build\roku\images"
os.makedirs(images_dir, exist_ok=True)

def create_rounded_card(width, height, radius, bg_color, border_color=None, border_width=1, shadow=True):
    # Render at 4x scale for super smooth anti-aliased corners
    scale = 4
    w, h, r = width * scale, height * scale, radius * scale
    bw = border_width * scale
    
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Optional subtle shadow layer at bottom
    if shadow:
        shadow_rect = [0, scale * 2, w, h]
        shadow_color = (200, 208, 220, 90)  # Very subtle soft shadow
        draw.rounded_rectangle(shadow_rect, radius=r, fill=shadow_color)
    
    # Card fill
    card_rect = [0, 0, w - 1, h - 1 - (scale if shadow else 0)]
    draw.rounded_rectangle(card_rect, radius=r, fill=bg_color)
    
    # Border
    if border_color and border_width > 0:
        draw.rounded_rectangle(card_rect, radius=r, outline=border_color, width=bw)
        
    # Resize down with high quality Lanczos filter
    final_img = img.resize((width, height), Image.Resampling.LANCZOS)
    return final_img

# 1. Sidebar background (260 x 960, radius 14)
sidebar_bg = create_rounded_card(260, 960, 14, (255, 255, 255, 255), (226, 232, 240, 255), border_width=1, shadow=False)
sidebar_bg.save(os.path.join(images_dir, "sidebar_bg.png"))
print("Generated sidebar_bg.png")

# 2. Sidebar active item (232 x 42, radius 10, soft mint)
sidebar_active_bg = create_rounded_card(232, 42, 10, (230, 247, 244, 255), None, border_width=0, shadow=False)
sidebar_active_bg.save(os.path.join(images_dir, "sidebar_active_bg.png"))
print("Generated sidebar_active_bg.png")

# 3. Announcement Bar background (1328 x 56, radius 14, warm pale amber with amber border)
announcement_bg = create_rounded_card(1328, 56, 14, (254, 243, 199, 255), (245, 158, 11, 255), border_width=1, shadow=False)
announcement_bg.save(os.path.join(images_dir, "announcement_bg.png"))
print("Generated announcement_bg.png")

# 4. Stat Card background (310 x 80, radius 12, white with subtle border)
stat_bg = create_rounded_card(310, 80, 12, (255, 255, 255, 255), (226, 232, 240, 255), border_width=1, shadow=True)
stat_bg.save(os.path.join(images_dir, "card_stat_bg.png"))
print("Generated card_stat_bg.png")

# 5. Verse Card background (580 x 260, radius 14, white with subtle border)
verse_bg = create_rounded_card(580, 260, 14, (255, 255, 255, 255), (226, 232, 240, 255), border_width=1, shadow=True)
verse_bg.save(os.path.join(images_dir, "card_verse_bg.png"))
print("Generated card_verse_bg.png")

# 6. Featured Book Card background (580 x 240, radius 14, white with subtle border)
book_bg = create_rounded_card(580, 240, 14, (255, 255, 255, 255), (226, 232, 240, 255), border_width=1, shadow=True)
book_bg.save(os.path.join(images_dir, "card_book_bg.png"))
print("Generated card_book_bg.png")

# 7. Quick Action Card background (336 x 112, radius 12, white with subtle border)
qa_bg = create_rounded_card(336, 112, 12, (255, 255, 255, 255), (226, 232, 240, 255), border_width=1, shadow=True)
qa_bg.save(os.path.join(images_dir, "card_quickaction_bg.png"))
print("Generated card_quickaction_bg.png")

# 8. Quick Action Card Focused background (336 x 112, radius 12, soft teal tint + teal border)
qa_focused_bg = create_rounded_card(336, 112, 12, (240, 253, 250, 255), (0, 201, 167, 255), border_width=2, shadow=True)
qa_focused_bg.save(os.path.join(images_dir, "card_quickaction_focused_bg.png"))
print("Generated card_quickaction_focused_bg.png")

# 9. Featured Book Pill Badge (136 x 32, pill radius 16, red #EF4444)
badge_bg = create_rounded_card(136, 32, 16, (239, 68, 68, 255), None, border_width=0, shadow=False)
badge_bg.save(os.path.join(images_dir, "badge_featured_book.png"))
print("Generated badge_featured_book.png")

# 10. Book Cover Portrait Graphic (90 x 135 portrait)
book_cover = Image.new("RGBA", (90 * 4, 135 * 4), (0, 0, 0, 0))
bdraw = ImageDraw.Draw(book_cover)
# Gradient or nice styled book cover
bdraw.rounded_rectangle([0, 0, 90*4 - 1, 135*4 - 1], radius=8*4, fill=(30, 58, 138, 255))
# Subtle spine highlight
bdraw.rectangle([0, 0, 8*4, 135*4], fill=(23, 37, 84, 255))
# Book title lines / motif
bdraw.rounded_rectangle([16*4, 24*4, 76*4, 52*4], radius=4*4, fill=(255, 255, 255, 40))
bdraw.line([22*4, 34*4, 70*4, 34*4], fill=(255, 255, 255, 220), width=3*4)
bdraw.line([22*4, 42*4, 58*4, 42*4], fill=(255, 255, 255, 180), width=2*4)
# Icon / heart motif in center
bdraw.ellipse([35*4, 72*4, 55*4, 92*4], fill=(0, 201, 167, 220))
# Author line at bottom
bdraw.line([20*4, 112*4, 70*4, 112*4], fill=(203, 213, 225, 180), width=2*4)
final_cover = book_cover.resize((90, 135), Image.Resampling.LANCZOS)
final_cover.save(os.path.join(images_dir, "book_cover_mindfulness.png"))
print("Generated book_cover_mindfulness.png")

print("=== ALL ASSETS GENERATED SUCCESSFULLY ===")
