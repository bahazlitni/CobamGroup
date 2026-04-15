export type Finish = {
	key: string;
	label: string;
	color: string;
}

export const FINISHES = [
	{ key: "STAINLESS_STEEL", label: "Acier inoxydable", color: "#919596" },
	{ key: "SATIN_GRAPHITE", label: "Graphite satin", color: "#5E5D5D" },
	{ key: "HARD_GRAPHITE", label: "Hard Graphite", color: "#6D6765" },
	{ key: "BRUSHED_HARD_GRAPHITE", label: "Hard Graphite (brossé)", color: "#6D6765" },
	{ key: "WHITE", label: "Blanc", color: "#F4F4F4" },
	{ key: "WHITE_CHROME", label: "Blanc chrome", color: "#D9D9D9" },
	{ key: "BRUSHED_WARM_SUNSET_BRONZE", label: "Bronze - Warm Sunset (brossé)", color: "#8A592F" },
	{ key: "CHROME", label: "Chrome", color: "#969696" },
	{ key: "BLACK_CHROME", label: "Noir chrome", color: "#171717" },
	{ key: "ANTIQUE_BRONZE", label: "Bronze antique", color: "#7B5946" },
	{ key: "COOL_SUNRISE_GOLD", label: "Doré - Cool Sunrise", color: "#91784D" },
	{ key: "BRUSHED_COOL_SUNRISE_GOLD", label: "Doré - Cool Sunrise (brossé)", color: "#7F6843" },
	{ key: "GRAPHITE", label: "Graphite", color: "#494949" },
	{ key: "BRUSHED_NICKEL", label: "Nickel (brossé)", color: "#8E8366" },
	{ key: "POLISHED_NICKEL", label: "Nickel poli", color: "#9F9270" },
	{ key: "ROSE_GOLD_PVD", label: "Doré PVD", color: "#633D28" },
	{ key: "MATT_BLACK", label: "Noir matt", color: "#292829" },
	{ key: "MATT_GOLD_PVD", label: "Or matt PVD", color: "#A88B5F" },
	{ key: "BRIGHT_ROSE_GOLD_PVD", label: "Or rosé brillant PVD", color: "#9A7C56" },
	{ key: "BRIGHT_GOLD_PVD", label: "Or brillant PVD", color: "#A58948" },
	
	{ key: "SOPAL_GREEN", label: "Vert", color: "#" },
	{ key: "SOPAL_BLUE", label: "Bleu", color: "#" },
];

export function resolveFinish(query: string | null | undefined): Finish | null {
	if(!query) return null;
	const normalizedQuery = query.trim().toLowerCase();
	return FINISHES.find(
		(finish: Finish) =>
			finish.key.toLowerCase() === normalizedQuery ||
			finish.label.toLowerCase() === normalizedQuery,
	) ?? null;
}


export function getFinishNameSuggestions(query: string): string[] {
    if(!query) return [];
    const lowerQuery = query.toLowerCase();
    return FINISHES.filter((finish: Finish) => finish.key.toLowerCase().startsWith(lowerQuery)).map((finish: Finish) => finish.key);
}

export function resolveFinishURL(finish: Finish): string {
	return `/images/finishes/${finish.key}.png`
}
