# Serene Village Revamped

Place tileset images here:

- **32x32/** → `Serene_Village_32x32.png` ← primary (32px tiles)
- **48x48/** → `Serene_Village_48x48.png`
- **16x16/** → `Serene_Village_16x16.png`

Load path for the 32×32 tileset (e.g. in BootScene):

`/assets/tilesets/Serene Village Revamped/32x32/Serene_Village_32x32.png`

Right now Silvertown draws the map with **Phaser Graphics** only (no tileset image). To use this tileset you’d need a tilemap (e.g. Tiled) that references this image, or custom code that blits tiles from it.
