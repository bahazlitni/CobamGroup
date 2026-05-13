export default function formatEnumLabel(value?: null | string): string {
    if(!value) return ""
    return value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}