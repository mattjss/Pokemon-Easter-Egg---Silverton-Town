import Phaser from 'phaser';

/**
 * Parse Tiled JSON: create collision from "Collision" object layer.
 * Expects object layer with rectangles (or polygons) that define solid areas.
 */
export class TiledUtils {
  /**
   * Create a tilemap layer or static group of collision bodies from Tiled
   * "Collision" object layer. If the layer is an object layer (not a tile layer),
   * we create invisible static bodies; otherwise we use tile collision.
   */
  static createCollisionLayerFromTiled(
    scene: Phaser.Scene,
    tilemap: Phaser.Tilemaps.Tilemap,
    layerName: string
  ): Phaser.Tilemaps.TilemapLayer | Phaser.Physics.Arcade.StaticGroup | null {
    const layer = tilemap.getObjectLayer(layerName);
    if (layer) {
      const group = scene.physics.add.staticGroup();
      for (const obj of layer.objects) {
        const w = obj.width ?? 16;
        const h = obj.height ?? 16;
        const x = (obj.x ?? 0) + w / 2;
        const y = (obj.y ?? 0) + h / 2;
        const rect = scene.add.rectangle(x, y, w, h, 0, 0).setVisible(false);
        group.add(rect);
      }
      return group;
    }

    const tileLayer = tilemap.getLayer(layerName);
    if (tileLayer?.name === layerName) {
      const tilemapLayer = tilemap.createLayer(layerName, tilemap.tilesets, 0, 0);
      if (tilemapLayer) {
        tilemapLayer.setCollisionByProperty({ collides: true });
        return tilemapLayer;
      }
    }

    const layerByIndex = tilemap.layers.find((l) => (l as Phaser.Tilemaps.LayerData).name === layerName);
    if (layerByIndex && 'tilemap' in layerByIndex) {
      const layerData = layerByIndex as Phaser.Tilemaps.LayerData;
      const tileset = tilemap.tilesets[0];
      const tilemapLayer = tilemap.createLayer(layerData.name, tileset, 0, 0);
      if (tilemapLayer) {
        tilemapLayer.setCollisionByProperty({ collides: true });
        return tilemapLayer;
      }
    }

    return null;
  }
}
