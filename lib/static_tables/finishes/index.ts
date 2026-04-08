export enum FinishCode {
    STAINLESS_STEEL,
  	SATIN_GRAPHITE,
  	HARD_GRAPHITE,
  	BRUSHED_HARD_GRAPHITE,
  	WHITE,
  	WHITE_CHROME,
  	BRUSHED_WARM_SUNSET_BRONZE,
  	CHROME,
  	BLACK_CHROME,
  	ANTIQUE_BRONZE,
  	COOL_SUNRISE_GOLD,
  	BRUSHED_COOL_SUNRISE_GOLD,
  	GRAPHITE,
  	BRUSHED_NICKEL,
  	POLISHED_NICKEL,
  	MATT_NICKEL,
  	MATT_BLACK,
  	MATT_GOLD_PVD,
  	POLISHED_ROSE_GOLD_PVD,
  	ROSE_GOLD_PVD,
}

export const FINISH_CODE_TO_LABEL: Record<FinishCode, string> = {
    [FinishCode.STAINLESS_STEEL]: "Acier inoxydable",
  	[FinishCode.SATIN_GRAPHITE]: "Graphite satin",
  	[FinishCode.HARD_GRAPHITE]: "Hard Graphite",
  	[FinishCode.BRUSHED_HARD_GRAPHITE]: "Hard Graphite (brossé)",
  	[FinishCode.WHITE]: "Blanc",
  	[FinishCode.WHITE_CHROME]: "Blanc chrome",
  	[FinishCode.BRUSHED_WARM_SUNSET_BRONZE]: "Bronze - Warm Sunset (brossé)",
  	[FinishCode.CHROME]: "Chrome",
  	[FinishCode.BLACK_CHROME]: "Noir chrome",
  	[FinishCode.ANTIQUE_BRONZE]: "Bronze antique",
  	[FinishCode.COOL_SUNRISE_GOLD]: "Doré - Cool Sunrise",
  	[FinishCode.BRUSHED_COOL_SUNRISE_GOLD]: "Doré - Cool Sunrise (brossé)",
  	[FinishCode.GRAPHITE]: "Graphite",
  	[FinishCode.BRUSHED_NICKEL]: "Nickel (brossé)",
  	[FinishCode.POLISHED_NICKEL]: "Nickel poli",
  	[FinishCode.MATT_NICKEL]: "Nickel matt",
  	[FinishCode.MATT_BLACK]: "Noir matt",
  	[FinishCode.MATT_GOLD_PVD]: "Or matt PVD",
  	[FinishCode.POLISHED_ROSE_GOLD_PVD]: "Or rosé poli PVD",
  	[FinishCode.ROSE_GOLD_PVD]: "Or rosé PVD",
} as const;

export const FINISH_NAMES = Object.values(FINISH_CODE_TO_LABEL);

function normalizeFinishKey(value: string | null | undefined) {
    return (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

export function strFinishCode(finishCode: FinishCode): string {
    return FINISH_CODE_TO_LABEL[finishCode];
}

export function parseFinish(value: string): FinishCode | null {
    const parsed = FinishCode[value as keyof typeof FinishCode];
    return parsed === undefined ? null : parsed;
}

export function resolveFinish(value: string | null | undefined) {
    const normalizedValue = normalizeFinishKey(value);

    if (!normalizedValue) {
        return null;
    }

    const byCode = Object.keys(FinishCode)
        .filter((key) => Number.isNaN(Number(key)))
        .find((key) => normalizeFinishKey(key) === normalizedValue);

    if (byCode) {
        const finishCode = FinishCode[byCode as keyof typeof FinishCode] as FinishCode;
        return {
            code: finishCode,
            label: FINISH_CODE_TO_LABEL[finishCode],
        };
    }

    const byLabel = FINISH_NAMES.find((name) => normalizeFinishKey(name) === normalizedValue);

    if (!byLabel) {
        return null;
    }

    return {
        code: null,
        label: byLabel,
    };
}

export function getFinishNameSuggestions(query: string): string[] {
    if(!query) return [];
    const lowerQuery = query.toLowerCase();
    return FINISH_NAMES.filter(name => name.toLowerCase().startsWith(lowerQuery));
}
