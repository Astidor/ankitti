import os
from PIL import Image, ImageOps

os.makedirs('public', exist_ok=True)
src_path = 'public/assets/hero_mascot.png'
base_img = Image.open(src_path).convert('RGBA')

# 1. Generate 512x512 standard icon
im_512 = base_img.resize((512, 512), Image.Resampling.LANCZOS)
im_512.save('public/icon-512.png', 'PNG')

# 2. Generate 192x192 standard icon
im_192 = base_img.resize((192, 192), Image.Resampling.LANCZOS)
im_192.save('public/icon-192.png', 'PNG')

# 3. Generate apple-touch-icon (180x180)
im_apple = base_img.resize((180, 180), Image.Resampling.LANCZOS)
im_apple.save('public/apple-touch-icon.png', 'PNG')

# 4. Generate maskable 512x512 icon (has safe margins so Android round/squircle cropping doesn't cut the mascot)
maskable = Image.new('RGBA', (512, 512), (255, 240, 245, 255)) # soft pastel pink
inner = base_img.resize((410, 410), Image.Resampling.LANCZOS)
maskable.paste(inner, (51, 51), inner if inner.mode == 'RGBA' else None)
maskable.save('public/icon-maskable.png', 'PNG')

# 5. Generate 48x48 favicon for Google Search results
im_48 = base_img.resize((48, 48), Image.Resampling.LANCZOS)
im_48.save('public/favicon-48x48.png', 'PNG')

# 6. Generate multi-resolution favicon.ico (16, 32, 48) for root fallback
base_img.save('public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])

print('Generated PWA & Google Search icons successfully!')
