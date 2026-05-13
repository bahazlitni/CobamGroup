import { StaffSelect } from "@/components/staff/ui";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import { Checkbox } from "@/components/ui/checkbox";
import formatEnumLabel from "@/lib/formatEnumLabel";
import type { ProductLifecycle } from "@prisma/client";
import { PRODUCT_LIFECYCLE_VALUES } from "@/features/products/lifecycle";

interface ProductEssentialEntriesProps {
  sku: string;
  name: string;
  brand: null | string;
  lifecycle: ProductLifecycle | null;
  skuPlaceholder?: string;
  namePlaceholder?: string;
  brandPlaceholder?: string;
  lifecyclePlaceholder?: string;
  brandOptions?: string[];
  disableSku?: boolean;
  disableName?: boolean;
  showLifecycle?: boolean;
  showFieldChecks?: boolean;
  fieldChecks?: Partial<
    Record<
      | "sku"
      | "name"
      | "brand"
      | "lifecycle",
      boolean
    >
  >;
  onFieldCheckChange?: (field: string, checked: boolean) => void;

  onSkuChanged: (sku: string) => void;
  onNameChanged: (name: string) => void;
  onBrandChanged: (brand: null | string) => void;
  onLifecycleChanged: (lifecycle: ProductLifecycle | null) => void;
}

export default function ProductEssentialEntries(form: ProductEssentialEntriesProps) {
  const showChecks = Boolean(form.showFieldChecks && form.onFieldCheckChange);
  const brandOptions = [...new Set(form.brandOptions ?? [])]
    .filter((brand) => brand.trim() !== "")
    .map((brand) => ({
      value: brand,
      label: brand,
    }));
  const isChecked = (field: string) =>
    form.fieldChecks?.[field as keyof typeof form.fieldChecks] ?? false;
  const labelNode = (field: string, label: string) => (
    <span className="inline-flex items-center gap-2">
      {showChecks ? (
        <Checkbox
          checked={isChecked(field)}
          onCheckedChange={(checked) =>
            form.onFieldCheckChange?.(field, Boolean(checked))
          }
          aria-label={`Modifier ${label}`}
        />
      ) : null}
      <span>{label}</span>
    </span>
  );
  const isDisabled = (field: string, extraDisabled?: boolean) =>
    Boolean(extraDisabled || (showChecks && !isChecked(field)));

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <PanelField id="product-sku" label={labelNode("sku", "SKU")}>
        <PanelInput
          id="product-sku"
          fullWidth
          value={form.sku}
          placeholder={form.skuPlaceholder}
          disabled={isDisabled("sku", form.disableSku)}
          onChange={(event) => form.onSkuChanged(event.target.value)}
        />
      </PanelField>

      <PanelField className="col-span-2" id="product-name" label={labelNode("name", "Nom")}>
        <PanelInput
          id="product-name"
          fullWidth
          value={form.name}
          placeholder={form.namePlaceholder}
          disabled={isDisabled("name", form.disableName)}
          onChange={(event) => form.onNameChanged(event.target.value)}
        />
      </PanelField>

      <PanelField id="product-brand" label={labelNode("brand", "Marque")}>
        <StaffSelect
          id="product-brand"
          fullWidth
          value={form.brand ?? null}
          placeholder={form.brandPlaceholder}
          emptyLabel="Aucune marque"
          disabled={isDisabled("brand")}
          options={brandOptions}
          onValueChange={(value) => form.onBrandChanged(value || null)}
        />
      </PanelField>

      {form.showLifecycle === false ? null : (
        <PanelField id="product-lifecycle" label={labelNode("lifecycle", "Cycle de vie")}>
          <StaffSelect
            id="product-lifecycle"
            fullWidth
            value={form.lifecycle ?? ""}
            placeholder={form.lifecyclePlaceholder}
            disabled={isDisabled("lifecycle")}
            onValueChange={(value: string) =>
              form.onLifecycleChanged(value ? (value as ProductLifecycle) : null)
            }
            options={PRODUCT_LIFECYCLE_VALUES.map((value) => ({
              value,
              label: formatEnumLabel(value),
            }))}
          />
        </PanelField>
      )}
    </div>
  );
}
