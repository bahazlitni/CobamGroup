export type ProductAttribute = {
	label: string;
	key: string;
	unit?: string;
}

export type ProductAttributeSuggestion = {
	key: string;
	label: string;
	tag?: string;
}

export const PRODUCT_ATTRIBUTES: ProductAttribute[] = [
	{
		key: "FINISH",
		label: "Finition",
	},
	{
		key: "COLOR",
		label: "Couleur",
	},
	{
		key: "SIZE",
		label: "Taille",
	},
	{
		key: "WIDTH_MM",
		label: "Largeur",
		unit: "mm"
	},
	{
		key: "HEIGHT_MM",
		label: "Hauteur",
		unit: "mm"
	},
	{
		key: "DEPTH_MM",
		label: "Profondeur",
		unit: "mm"
	},
	{
		key: "THICKNESS_MM",
		label: "Epaisseur",
		unit: "mm"
	},
	{
		key: "VOLUME_M3",
		label: "Volume",
		unit: "m3"
	},
	{
		key: "VOLUME_L",
		label: "Volume",
		unit: "L"
	},
	{
		key: "SURFACE_M2",
		label: "Surface",
		unit: "m2"
	},
	{
		key: "LENGTH_MM",
		label: "Longueur",
		unit: "mm"
	},
	{
		key: "WEIGHT_KG",
		label: "Poids",
		unit: "Kg"
	},
	{
		key: "GRID_SPACING",
		label: "Mailles",
		unit: "cm"
	},
	{
		key: "NUMBER",
		label: "Nombre",
	}

] as const;

function normalizeAttributeKey(key: string | null | undefined) {
	return (key ?? "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.trim()
		.toLowerCase()
		.replace(/\s+/g, " ");
}

export const PRODUCT_ATTRIBUTE_KINDS = PRODUCT_ATTRIBUTES.map((attribute) => attribute.key);

export function resolveProductAttribute(key: string | null | undefined): ProductAttribute | null {
	const normalizedkey = normalizeAttributeKey(key);

	if (!normalizedkey) {
		return null;
	}

	return (
		PRODUCT_ATTRIBUTES.find(
			(attribute) => normalizeAttributeKey(attribute.key) === normalizedkey,
		) ?? null
	);
}

export function normalizeProductAttributeKind(key: string | null | undefined) {
	const trimmedkey = (key ?? "").trim();

	if (!trimmedkey) {
		return "";
	}

	return resolveProductAttribute(trimmedkey)?.key ?? trimmedkey;
}

export function formatProductAttributeKind(key: string | null | undefined) {
	if (!key) {
		return "";
	}

	return resolveProductAttribute(key)?.label ?? key;
}

export function getProductAttributeUnit(key: string | null | undefined) {
	return resolveProductAttribute(key)?.unit ?? null;
}

export function getAttributeNameSuggestions(query: string): ProductAttributeSuggestion[] {
	if(!query) return [];
	const lowerQuery = normalizeAttributeKey(query);
	return PRODUCT_ATTRIBUTES
		.filter((attr) => normalizeAttributeKey(attr.key).startsWith(lowerQuery))
		.map((attr) => ({
			key: attr.key,
			label: attr.key,
			tag: attr.unit,
		}));
}

export function enumProductAttributKindToLabel(key: string) {
	return formatProductAttributeKind(key);
}
