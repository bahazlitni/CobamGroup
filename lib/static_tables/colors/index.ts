export type Color = {
    label: string;
    value: string;
    key: string;
}

export const COLORS: readonly Color[] = [
  { key: "SIKACERAM_MAHOGANY", label: "Mogano", value: "#6B3E2E" },
  { key: "SIKACERAM_RUBY", label: "Rubino", value: "#8B2E3C" },
  { key: "SIKACERAM_TERRACOTTA", label: "Cotto", value: "#B5654D" },
  { key: "SIKACERAM_AMARANTH", label: "Amaranto", value: "#8E4A57" },
  { key: "SIKACERAM_BROWN", label: "Marrone", value: "#7A5A46" },
  { key: "SIKACERAM_OAK_WOOD", label: "Legno di quercia", value: "#8B6A4E" },
  { key: "SIKACERAM_WALNUT", label: "Noce", value: "#6F4E37" },
  { key: "SIKACERAM_BEECH_WOOD", label: "Legno di faggio", value: "#B08A67" },
  { key: "SIKACERAM_CARAMEL", label: "Caramel", value: "#B67A3C" },
  { key: "SIKACERAM_CEDAR", label: "Cedro", value: "#8A5A3B" },
  { key: "SIKACERAM_TORTORA", label: "Tortora", value: "#9A8F84" },
  { key: "SIKACERAM_GREY", label: "Grigio", value: "#7D7F7D" },
  { key: "SIKACERAM_LIGHT_SAND", label: "Sabbia chiara", value: "#D8C7A3" },
  { key: "SIKACERAM_PINE", label: "Pino", value: "#C4B08A" },
  { key: "SIKACERAM_MAPLE_WOOD", label: "Legno d'acero", value: "#C79E6E" },
  { key: "SIKACERAM_ANEMONE", label: "Anemone", value: "#D8D0C4" },
  { key: "SIKACERAM_BEIGE", label: "Beige", value: "#D9C9A5" },
  { key: "SIKACERAM_JASMINE", label: "Jasmine", value: "#F0E7D5" },
  { key: "SIKACERAM_WHITE", label: "Bianco", value: "#F5F5F2" },
  { key: "SIKACERAM_PERGAMON", label: "Pergamon", value: "#E8DFCF" },
  { key: "SIKACERAM_SILVER", label: "Silver", value: "#BFC3C7" },
  { key: "SIKACERAM_LIGHT_GREY", label: "Grigio chiaro", value: "#C9C9C4" },
  { key: "SIKACERAM_ICE", label: "Ghiaccio", value: "#DDE3E6" },
  { key: "SIKACERAM_MANHATTAN", label: "Manhattan", value: "#A6A8A6" },
  { key: "SIKACERAM_SAND", label: "Sabbia", value: "#BFA77F" },
  { key: "SIKACERAM_ASH", label: "Cenere", value: "#8B8F8A" },
  { key: "SIKACERAM_GRAPHITE", label: "Grafite", value: "#4F5357" },
  { key: "SIKACERAM_ANTHRACITE", label: "Antracite", value: "#3E4347" },
  { key: "SIKACERAM_TOTAL_BLACK", label: "Nero assoluto", value: "#1E1E1C" },
] as const;

const COLOR_NAME_TO_HEX: Record<string, string> = COLORS.reduce((acc, color) => {
    acc[color.label] = color.value;
    return acc;
}, {} as Record<string, string>);

const COLOR_KEY_TO_HEX: Record<string, string> = COLORS.reduce((acc, color) => {
    acc[color.key] = color.value;
    return acc;
}, {} as Record<string, string>);

const COLOR_HEX_TO_LABEL: Record<string, string> = COLORS.reduce((acc, color) => {
    acc[color.value] = color.label;
    return acc;
}, {} as Record<string, string>);

export function getHexCodeByName(label: string): string | undefined {
    return COLOR_NAME_TO_HEX[label];
}

export function getNameByHexCode(value: string): string | undefined {
    return COLOR_HEX_TO_LABEL[value];
}

export function getColorNameSuggestions(query: string): string[] {
    if(!query) return [];
    const lowerQuery = query.toLowerCase();
    return COLORS.filter(color => color.key.toLowerCase().startsWith(lowerQuery)).map(color => color.key);
}

function normalizeColorKey(value: string | null | undefined) {
    return (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

export function resolveColorHex(value: string | null | undefined): string | null {
    const trimmedValue = (value ?? "").trim();

    if (!trimmedValue) {
        return null;
    }

    const exactHex = trimmedValue.match(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
    if (exactHex) {
        const hexValue = trimmedValue.toUpperCase();
        return hexValue.length === 4
            ? `#${hexValue[1]}${hexValue[1]}${hexValue[2]}${hexValue[2]}${hexValue[3]}${hexValue[3]}`
            : hexValue;
    }

    const normalizedValue = normalizeColorKey(trimmedValue);
    const matchedColor = COLORS.find(
        (color) =>
            normalizeColorKey(color.key) === normalizedValue ||
            normalizeColorKey(color.label) === normalizedValue ||
            normalizeColorKey(color.value) === normalizedValue,
    );

    return matchedColor?.value ?? null;
}

export function getHexCodeByKey(key: string): string | undefined {
    return COLOR_KEY_TO_HEX[key];
}
