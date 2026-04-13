import { PanelAutoCompleteInput, StaffSelect } from "@/components/staff/ui";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import { Checkbox } from "@/components/ui/checkbox";
import formatEnumLabel from "@/lib/formatEnumLabel";
import { getProductBrandSuggestions } from "@/lib/static_tables/brands";
import { ProductCommercialMode, ProductLifecycle, ProductStockUnit } from "@prisma/client";

interface ProductEssentialEntriesProps {
  sku: string;
  name: string;
  brand: null | string;
  basePriceAmount: null | string;
  vatRate: null | number;
  stock: null | string;
  stockUnit: null | ProductStockUnit;
  lifecycle: ProductLifecycle | null;
  commercialMode: ProductCommercialMode | null;
  visibility: boolean | null;
  priceVisibility: boolean | null;
  stockVisibility: boolean | null;
  skuPlaceholder?: string;
  namePlaceholder?: string;
  brandPlaceholder?: string;
  basePricePlaceholder?: string;
  vatRatePlaceholder?: string;
  stockPlaceholder?: string;
  stockUnitPlaceholder?: string;
  lifecyclePlaceholder?: string;
  commercialModePlaceholder?: string;
  visibilityPlaceholder?: string;
  priceVisibilityPlaceholder?: string;
  stockVisibilityPlaceholder?: string;
  disableSku?: boolean;
  disableName?: boolean;
  showFieldChecks?: boolean;
  fieldChecks?: Partial<
    Record<
      | "sku"
      | "name"
      | "brand"
      | "basePriceAmount"
      | "vatRate"
      | "stock"
      | "stockUnit"
      | "lifecycle"
      | "commercialMode"
      | "visibility"
      | "priceVisibility"
      | "stockVisibility",
      boolean
    >
  >;
  onFieldCheckChange?: (field: string, checked: boolean) => void;

  onSkuChanged: (sku: string) => void;
  onNameChanged: (name: string) => void;
  onBrandChanged: (brand: null | string) => void;
  onBasePriceAmountChanged: (basePriceAmount: null | string) => void;
  onVatRateChanged: (vatRate: null | number) => void;
  onStockChanged: (stock: null | string) => void;
  onStockUnitChanged: (stockUnit: null | ProductStockUnit) => void;
  onLifecycleChanged: (lifecycle: ProductLifecycle | null) => void;
  onCommercialModeChanged: (commercialMode: ProductCommercialMode | null) => void;
  onVisibilityChanged: (visibility: boolean | null) => void;
  onPriceVisibilityChanged: (priceVisibility: boolean | null) => void;
  onStockVisibilityChanged: (stockVisibility: boolean | null) => void;
}

export default function ProductEssentialEntries(form: ProductEssentialEntriesProps) {
  const showChecks = Boolean(form.showFieldChecks && form.onFieldCheckChange);
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
    <div className="grid gap-6 md:grid-cols-5">
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
        <PanelAutoCompleteInput
          id="product-brand"
          fullWidth
          value={form.brand ?? ""}
          placeholder={form.brandPlaceholder}
          disabled={isDisabled("brand")}
          suggestions={getProductBrandSuggestions(form.brand ?? "")}
          onValueChange={(value) => form.onBrandChanged(value || null)}
        />
      </PanelField>

      <PanelField id="product-price" label={labelNode("basePriceAmount", "Prix de base")}>
        <PanelInput
          fullWidth
          type="number"
          id="product-price"
          value={form.basePriceAmount ?? ""}
          placeholder={form.basePricePlaceholder}
          disabled={isDisabled("basePriceAmount")}
          onChange={(event) => form.onBasePriceAmountChanged(event.target.value || null)}
        />
      </PanelField>

      <PanelField id="product-vat" label={labelNode("vatRate", "TVA")}>
        <PanelInput
          fullWidth
          id="product-vat"
          type="number"
          value={form.vatRate == null ? "" : String(form.vatRate)}
          placeholder={form.vatRatePlaceholder}
          disabled={isDisabled("vatRate")}
          onChange={(event) =>
            form.onVatRateChanged(event.target.value ? Number(event.target.value) : null)
          }
        />
      </PanelField>

      <PanelField id="product-stock" label={labelNode("stock", "Stock")}>
        <PanelInput
          fullWidth
          id="product-stock"
          type="number"
          value={form.stock ?? ""}
          placeholder={form.stockPlaceholder}
          disabled={isDisabled("stock")}
          onChange={(event) => form.onStockChanged(event.target.value || null)}
        />
      </PanelField>

      <PanelField id="product-stock-unit" label={labelNode("stockUnit", "Unite de stock")}>
        <StaffSelect
          id="product-stock-unit"
          fullWidth
          value={form.stockUnit ?? ""}
          placeholder={form.stockUnitPlaceholder}
          disabled={isDisabled("stockUnit")}
          onValueChange={(value: string) =>
            form.onStockUnitChanged((value as ProductStockUnit) ?? null)
          }
          options={Object.values(ProductStockUnit).map((value) => ({
            value,
            label: formatEnumLabel(value),
          }))}
        />
      </PanelField>

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
          options={Object.values(ProductLifecycle).map((value) => ({
            value,
            label: formatEnumLabel(value),
          }))}
        />
      </PanelField>

      <PanelField id="product-commercial" label={labelNode("commercialMode", "Mode commercial")}>
        <StaffSelect
          id="product-commercial"
          fullWidth
          value={form.commercialMode ?? ""}
          placeholder={form.commercialModePlaceholder}
          disabled={isDisabled("commercialMode")}
          onValueChange={(value: string) =>
            form.onCommercialModeChanged(value ? (value as ProductCommercialMode) : null)
          }
          options={Object.values(ProductCommercialMode).map((value) => ({
            value,
            label: formatEnumLabel(value),
          }))}
        />
      </PanelField>

      <PanelField id="product-visibility" label={labelNode("visibility", "Visible")}>
        <StaffSelect
          id="product-visibility"
          fullWidth
          value={form.visibility == null ? "" : String(form.visibility)}
          placeholder={form.visibilityPlaceholder}
          disabled={isDisabled("visibility")}
          onValueChange={(value: string) =>
            form.onVisibilityChanged(value ? value === "true" : null)
          }
          options={[
            { value: "true", label: "Oui" },
            { value: "false", label: "Non" },
          ]}
        />
      </PanelField>

      <PanelField id="product-price-visibility" label={labelNode("priceVisibility", "Prix visible")}>
        <StaffSelect
          id="product-price-visibility"
          fullWidth
          value={form.priceVisibility == null ? "" : String(form.priceVisibility)}
          placeholder={form.priceVisibilityPlaceholder}
          disabled={isDisabled("priceVisibility")}
          onValueChange={(value: string) =>
            form.onPriceVisibilityChanged(value ? value === "true" : null)
          }
          options={[
            { value: "true", label: "Oui" },
            { value: "false", label: "Non" },
          ]}
        />
      </PanelField>

      <PanelField id="product-stock-visibility" label={labelNode("stockVisibility", "Stock visible")}>
        <StaffSelect
          id="product-stock-visibility"
          fullWidth
          value={form.stockVisibility == null ? "" : String(form.stockVisibility)}
          placeholder={form.stockVisibilityPlaceholder}
          disabled={isDisabled("stockVisibility")}
          onValueChange={(value: string) =>
            form.onStockVisibilityChanged(value ? value === "true" : null)
          }
          options={[
            { value: "true", label: "Oui" },
            { value: "false", label: "Non" },
          ]}
        />
      </PanelField>
    </div>
  );
}
