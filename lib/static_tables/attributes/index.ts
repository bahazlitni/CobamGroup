export type ProductAttribute = {
	label: string;
	value: string;
	unit?: string;
}

export type ProductAttributeSuggestion = {
	value: string;
	label: string;
	tag?: string;
}

export const PRODUCT_ATTRIBUTES: ProductAttribute[] = [
	{
		value: "FINISH",
		label: "Finition",
	},
	{
		value: "COLOR",
		label: "Couleur",
	},
	{
		value: "SIZE",
		label: "Taille",
	},
	{
		value: "WIDTH_MM",
		label: "Largeur",
		unit: "mm"
	},
	{
		value: "HEIGHT_MM",
		label: "Hauteur",
		unit: "mm"
	},
	{
		value: "DEPTH_MM",
		label: "Profondeur",
		unit: "mm"
	},
	{
		value: "THICKNESS_MM",
		label: "Epaisseur",
		unit: "mm"
	},
	{
		value: "VOLUME_M3",
		label: "Volume",
		unit: "m3"
	},
	{
		value: "VOLUME_L",
		label: "Volume",
		unit: "L"
	},
	{
		value: "SURFACE_M2",
		label: "Surface",
		unit: "m2"
	},
	{
		value: "LENGTH_MM",
		label: "Longueur",
		unit: "mm"
	},
	{
		value: "WEIGHT_KG",
		label: "Poids",
		unit: "Kg"
	}
] as const;

function normalizeAttributeKey(value: string | null | undefined) {
	return (value ?? "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.trim()
		.toLowerCase()
		.replace(/\s+/g, " ");
}

export const PRODUCT_ATTRIBUTE_KINDS = PRODUCT_ATTRIBUTES.map((attribute) => attribute.value);

export function resolveProductAttribute(value: string | null | undefined): ProductAttribute | null {
	const normalizedValue = normalizeAttributeKey(value);

	if (!normalizedValue) {
		return null;
	}

	const exactValueMatch =
		PRODUCT_ATTRIBUTES.find(
			(attribute) => normalizeAttributeKey(attribute.value) === normalizedValue,
		) ?? null;

	if (exactValueMatch) {
		return exactValueMatch;
	}

	const labelMatches = PRODUCT_ATTRIBUTES.filter(
		(attribute) => normalizeAttributeKey(attribute.label) === normalizedValue,
	);

	return labelMatches.length === 1 ? labelMatches[0] : null;
}

export function normalizeProductAttributeKind(value: string | null | undefined) {
	const trimmedValue = (value ?? "").trim();

	if (!trimmedValue) {
		return "";
	}

	return resolveProductAttribute(trimmedValue)?.value ?? trimmedValue;
}

export function formatProductAttributeKind(value: string | null | undefined) {
	if (!value) {
		return "";
	}

	return resolveProductAttribute(value)?.label ?? value;
}

export function getProductAttributeUnit(value: string | null | undefined) {
	return resolveProductAttribute(value)?.unit ?? null;
}

export function getAttributeNameSuggestions(query: string): ProductAttributeSuggestion[] {
	if(!query) return [];
	const lowerQuery = normalizeAttributeKey(query);
	return PRODUCT_ATTRIBUTES
		.filter((attr) => normalizeAttributeKey(attr.label).startsWith(lowerQuery))
		.map((attr) => ({
			value: attr.value,
			label: attr.label,
			tag: attr.unit,
		}));
}

export function enumProductAttributKindToLabel(value: string) {
	return formatProductAttributeKind(value);
}
