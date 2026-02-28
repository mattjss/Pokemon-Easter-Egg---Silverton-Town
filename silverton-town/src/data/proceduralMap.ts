/**
 * Procedural 50x40 map, 32px per tile. FireRed-style colors.
 */
export const PROC_MAP_WIDTH = 50;
export const PROC_MAP_HEIGHT = 40;
export const TILE_PX = 32;

export const T = {
  GRASS: 0,
  GRASS_DARK: 1,
  PATH: 2,
  BUILDING_WALL: 3,
  BUILDING_ROOF: 4,
  WATER: 5,
  FLOWERS: 6,
  TREE_TOP: 7,
  TREE_TRUNK: 8,
  BORDER: 9,
  DOOR: 10,
} as const;

const GRASS = 0x78c850;
const GRASS_DARK = 0x5ca335;
const PATH = 0xe8d8a0;
const WALL = 0xf8f8d0;
const ROOF = 0xc03028;
const WATER = 0x6890f0;
const FLOWERS = 0xf85888;
const TREE_TOP = 0x409040;
const TREE_TRUNK = 0x285028;
const BORDER = 0xa8a878;
const DOOR = 0x8b7355;

export const TILE_COLORS: Record<number, number> = {
  [T.GRASS]: GRASS,
  [T.GRASS_DARK]: GRASS_DARK,
  [T.PATH]: PATH,
  [T.BUILDING_WALL]: WALL,
  [T.BUILDING_ROOF]: ROOF,
  [T.WATER]: WATER,
  [T.FLOWERS]: FLOWERS,
  [T.TREE_TOP]: TREE_TOP,
  [T.TREE_TRUNK]: TREE_TRUNK,
  [T.BORDER]: BORDER,
  [T.DOOR]: DOOR,
};

export function buildProceduralMap(): number[][] {
  const map: number[][] = Array.from({ length: PROC_MAP_HEIGHT }, () => Array(PROC_MAP_WIDTH).fill(T.GRASS));

  const set = (x: number, y: number, v: number) => {
    if (y >= 0 && y < PROC_MAP_HEIGHT && x >= 0 && x < PROC_MAP_WIDTH) map[y][x] = v;
  };
  const rect = (x0: number, y0: number, w: number, h: number, v: number) => {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) set(x, y, v);
  };

  // Row 0-1: border
  for (let x = 0; x < PROC_MAP_WIDTH; x++) {
    set(x, 0, T.BORDER);
    set(x, 1, T.BORDER);
  }
  for (let y = 0; y < PROC_MAP_HEIGHT; y++) {
    set(0, y, T.BORDER);
    set(PROC_MAP_WIDTH - 1, y, T.BORDER);
  }

  // Rows 2-4: Town Square — path cols 18-32
  rect(18, 2, 15, 3, T.PATH);
  // Fountain at (25,3): 2x2 water with gray border
  set(24, 2, T.BORDER);
  set(25, 2, T.BORDER);
  set(26, 2, T.BORDER);
  set(24, 3, T.BORDER);
  set(25, 3, T.WATER);
  set(26, 3, T.WATER);
  set(24, 4, T.BORDER);
  set(25, 4, T.BORDER);
  set(26, 4, T.BORDER);

  // Rows 5-8: transition path + grass
  for (let x = 18; x <= 32; x++) {
    set(x, 5, T.PATH);
    set(x, 6, T.PATH);
    set(x, 7, T.PATH);
    set(x, 8, T.PATH);
  }

  // Rows 9-10: Roofs — left 3-10, right 38-45
  rect(3, 9, 8, 2, T.BUILDING_ROOF);
  rect(38, 9, 8, 2, T.BUILDING_ROOF);

  // Rows 11-18: Walls
  rect(3, 11, 8, 8, T.BUILDING_WALL);
  rect(38, 11, 8, 8, T.BUILDING_WALL);
  set(5, 13, 0x404040); // window
  set(7, 13, 0x404040);
  set(40, 13, 0x404040);
  set(42, 13, 0x404040);
  set(6, 14, T.DOOR);
  set(42, 14, T.DOOR);

  // Center path rows 11-18
  for (let y = 11; y <= 18; y++)
    for (let x = 12; x <= 36; x++)
      if (map[y][x] === T.GRASS) map[y][x] = (x + y) % 3 === 0 ? T.PATH : T.GRASS;

  // Trees along top and sides
  const treePositions: [number, number][] = [
    [2, 2], [5, 2], [35, 2], [46, 2], [15, 4], [36, 4], [12, 12], [37, 12], [20, 20], [30, 20],
  ];
  for (const [tx, ty] of treePositions) {
    set(tx, ty, T.TREE_TOP);
    set(tx, ty + 1, T.TREE_TRUNK);
  }

  // Rows 19-22: path to field
  for (let x = 22; x <= 28; x++) {
    set(x, 19, T.PATH);
    set(x, 20, T.PATH);
    set(x, 21, T.PATH);
    set(x, 22, T.PATH);
  }

  // Rows 23-38: Sports field — grass_dark
  for (let y = 23; y <= 38; y++)
    for (let x = 1; x < PROC_MAP_WIDTH - 1; x++)
      if (map[y][x] === T.GRASS) map[y][x] = T.GRASS_DARK;

  // Baseball diamond: cols 20-28, rows 28-35
  for (let r = 0; r < 4; r++) {
    const mid = 24;
    for (let i = -r; i <= r; i++) {
      set(mid + i, 28 + r, T.PATH);
      set(mid + i, 35 - r, T.PATH);
    }
  }
  for (let c = 20; c <= 28; c++) set(c, 31, T.PATH);

  // Hockey net: cols 10-14, rows 26-28
  rect(10, 26, 5, 3, T.BORDER);

  // Scattered flowers
  for (let y = 2; y <= 38; y++)
    for (let x = 1; x < PROC_MAP_WIDTH - 1; x++)
      if ((map[y][x] === T.GRASS || map[y][x] === T.GRASS_DARK) && (x * 7 + y * 11) % 17 === 0)
        map[y][x] = T.FLOWERS;

  return map;
}

export function buildProceduralCollision(map: number[][]): number[][] {
  const col: number[][] = [];
  for (let y = 0; y < PROC_MAP_HEIGHT; y++) {
    col[y] = [];
    for (let x = 0; x < PROC_MAP_WIDTH; x++) {
      const t = map[y][x];
      const blocked =
        t === T.WATER ||
        t === T.BUILDING_WALL ||
        t === T.BUILDING_ROOF ||
        t === T.TREE_TOP ||
        t === T.TREE_TRUNK ||
        t === T.BORDER;
      col[y][x] = blocked ? 1 : 0;
    }
  }
  return col;
}
