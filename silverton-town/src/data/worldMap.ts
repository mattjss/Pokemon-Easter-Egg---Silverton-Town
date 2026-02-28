/**
 * 40x30 tile grid. Tile types: 0=grass, 1=path, 2=building_wall, 3=building_roof, 4=water, 5=grass_dark, 6=flowers.
 * map[y][x], y in [0,29], x in [0,39].
 */
export const MAP_WIDTH = 40;
export const MAP_HEIGHT = 30;
export const TILE_SIZE = 32;

export const TILE = {
  GRASS: 0,
  PATH: 1,
  BUILDING_WALL: 2,
  BUILDING_ROOF: 3,
  WATER: 4,
  GRASS_DARK: 5,
  FLOWERS: 6,
} as const;

function createEmptyMap(): number[][] {
  return Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill(TILE.GRASS));
}

export function buildTileMap(): number[][] {
  const map = createEmptyMap();
  const set = (x: number, y: number, v: number) => {
    if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) map[y][x] = v;
  };
  const setRect = (x0: number, y0: number, w: number, h: number, v: number) => {
    for (let y = y0; y < y0 + h; y++)
      for (let x = x0; x < x0 + w; x++) set(x, y, v);
  };

  // Water top-left cols 0-3, rows 0-4
  setRect(0, 0, 4, 5, TILE.WATER);

  // Rows 0-2: scatter flowers at fixed positions
  for (let y = 0; y < 3; y++)
    for (let x = 4; x < MAP_WIDTH; x++)
      if ((x + y * 7) % 11 === 0) map[y][x] = TILE.FLOWERS;

  // Row 3: path cols 8-32
  for (let x = 8; x <= 32; x++) set(x, 3, TILE.PATH);

  // Rows 4-8: Town Square path cols 15-25
  setRect(15, 4, 11, 5, TILE.PATH);

  // Rows 9-10: rooftops Matt's House (2-9), Matt Design (30-38)
  setRect(2, 9, 8, 2, TILE.BUILDING_ROOF);
  setRect(30, 9, 9, 2, TILE.BUILDING_ROOF);

  // Rows 11-20: building walls + path between
  setRect(2, 11, 8, 10, TILE.BUILDING_WALL);
  setRect(30, 11, 9, 10, TILE.BUILDING_WALL);
  for (let y = 11; y <= 20; y++)
    for (let x = 10; x <= 29; x++) set(x, y, TILE.PATH);

  // Rows 21-22: path to field
  for (let x = 18; x <= 22; x++) {
    set(x, 21, TILE.PATH);
    set(x, 22, TILE.PATH);
  }

  // Rows 23-29: Sports field — grass_dark, some path and flowers
  for (let y = 23; y <= 29; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (map[y][x] === TILE.GRASS) map[y][x] = TILE.GRASS_DARK;
    }
  }
  setRect(19, 24, 3, 4, TILE.PATH);
  for (let y = 23; y <= 29; y++)
    for (let x = 0; x < MAP_WIDTH; x++)
      if (map[y][x] === TILE.GRASS_DARK && (x * 3 + y * 5) % 7 === 0) map[y][x] = TILE.FLOWERS;

  return map;
}

/** Collision: 1 = blocked, 0 = walkable. */
export function buildCollisionMap(tileMap: number[][]): number[][] {
  const col = Array.from({ length: MAP_HEIGHT }, (_, y) =>
    Array.from({ length: MAP_WIDTH }, (_, x) => {
      if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) return 1;
      const t = tileMap[y][x];
      return t === TILE.WATER || t === TILE.BUILDING_WALL || t === TILE.BUILDING_ROOF ? 1 : 0;
    })
  );
  return col;
}
