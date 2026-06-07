/** Shared isometric projection helpers for Forgeheart City. */

export const TILE_W = 64;
export const TILE_H = 32;

/** Grid (col,row) → screen (x,y) at the tile's top-center. */
export function isoToScreen(col: number, row: number, ox = 0, oy = 0) {
  return {
    x: (col - row) * (TILE_W / 2) + ox,
    y: (col + row) * (TILE_H / 2) + oy,
  };
}

/** Painter's-order depth for an entity at (col,row). Higher = nearer = on top. */
export function isoDepth(col: number, row: number) {
  return Math.round((col + row) * 1000 + (col - row));
}
