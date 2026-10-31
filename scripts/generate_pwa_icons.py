import os
from PIL import Image, ImageOps

os.makedirs('public', exist_ok=True)
# Masters are 1024x1024 renders of the cat-eared card mark (see public/favicon.svg).
src_path = 'scripts/icon-src/app-icon.png'
base_img = Image.open(src_path).convert('RGBA')
mask_img = Image.open('scripts/icon-src/app-icon-maskable.png').convert('RGBA')

# 1. Generate 512x512 standard icon
im_512 = base_img.resize((512, 512), Image.Resampling.LANCZOS)
im_512.save('public/icon-512.png', 'PNG')

# 2. Generate 192x192 standard icon
im_192 = base_img.resize((192, 192), Image.Resampling.LANCZOS)
im_192.save('public/icon-192.png', 'PNG')

# 3. Generate apple-touch-icon (180x180)
im_apple = base_img.resize((180, 180), Image.Resampling.LANCZOS)
im_apple.save('public/apple-touch-icon.png', 'PNG')

# 4. Maskable 512x512 icon: the mark sits inside the safe zone so round/squircle crops keep it whole
mask_img.resize((512, 512), Image.Resampling.LANCZOS).save('public/icon-maskable.png', 'PNG')

# 5. Generate 48x48 favicon for Google Search results
im_48 = base_img.resize((48, 48), Image.Resampling.LANCZOS)
im_48.save('public/favicon-48x48.png', 'PNG')

# 6. Generate multi-resolution favicon.ico (16, 32, 48) for root fallback
base_img.save('public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])

print('Generated PWA & Google Search icons successfully!')
