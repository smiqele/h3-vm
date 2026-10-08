export const TERMINAL_GLYPHS = [
  "h", "c", "3",
  ">", "=", "+", "{", "}", "#", "&", "~", ";",
];

export const LESS_LIME_GLYPHS = [
  ...TERMINAL_GLYPHS, "@", "%", "*", "?", "\\", "^",
];

// Смещения заданы для ячеек размером 76 px на странице образцов.
export const LESS_LIME_GLYPH_OFFSETS: Record<string, { x: number; y: number }> = {
  ";": { x: 0, y: -5 },
  "{": { x: -1, y: -3 },
  "}": { x: 1, y: -3 },
  "@": { x: 0, y: -3 },
  "*": { x: 0, y: 10 },
  "\\": { x: 0, y: -3 },
  "^": { x: 0, y: 8 },
};
