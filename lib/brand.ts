export const brand = {
  personalColors: {
    icyWhite: "#f2feff",
    lightBlue: "#87b5ff",
    periwinkle: "#8c9fff",
  },
  discord: {
    // Discord embed color chosen from personal palette (연보라)
    embedHex: "#8c9fff",
    // Decimal integer form for Discord API embeds
    embedDecimal: 9215999,
  },
} as const;

export type Brand = typeof brand;
