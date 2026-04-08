export type Size = "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl"

export const SIZES: Size[] = ["xs", "sm", "md", "lg", "xl", "xxl", "xxxl"] as const;

export function getSizeNameSuggestions(query: string): Size[] {
    if(!query) return [];
    const lowerQuery = query.toLowerCase();
    return SIZES.filter(name => name.toLowerCase().startsWith(lowerQuery));
}