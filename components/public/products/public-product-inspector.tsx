"use client";

import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import Carousel from "./inspector/Carousel";
import Title from "./inspector/Title";
import {
  buildColorOptions,
  buildFinishOptions,
  buildNormalAttributeGroups,
  findVariantByNormalAttribute,
  findVariantBySpecialValues,
  getVariantAttributeValue,
  getVariantFinishKey,
  getVariantMedia,
  getVariantSpecialValue,
  normalizeComparableValue,
  normalizeInspectorProduct,
  PublicProductInspectorViewProps,
  resolveInitialVariantId,
  SelectorPillProps,
} from "./inspector/utils";
import RichDescription from "./inspector/RichDescription";
import ColorsList from "./inspector/ColorsList";
import FinishesList from "./inspector/FinishesList";
import NormalAttributesList from "./inspector/NormalAttributesList";
import DatasheetLink from "./inspector/DatasheetLink";
import ProductDevisDialog from "./inspector/ProductDevisDialog";
import Property from "./inspector/Property";
import BrandTooltip from "./inspector/BrandTooltip";

function SelectorPill({ label, unit, active, onClick }: SelectorPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-[13px] font-semibold tracking-wide transition-all",
        active
          ? "border-[#14202e] bg-[#14202e] text-white shadow-md"
          : "border-cobam-quill-grey/50 bg-[#fafaf9] text-[#5e5e5e] hover:border-[#14202e] hover:text-[#14202e]",
      )}
    >
      {label}
      {unit}
    </button>
  );
}

export default function PublicProductInspectorView({ product }: PublicProductInspectorViewProps) {
  const normalizedProduct = normalizeInspectorProduct(product);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  const selectedVariant =
    normalizedProduct.variants.find(
      (variant) => variant.id === (selectedVariantId ?? resolveInitialVariantId(normalizedProduct)),
    ) ??
    normalizedProduct.variants[0] ??
    null;

  const selectedMedia = getVariantMedia(selectedVariant, normalizedProduct.coverMedia);
  const colorOptions = buildColorOptions(normalizedProduct);
  const finishOptions = buildFinishOptions(normalizedProduct);

  const normalAttributeGroups = buildNormalAttributeGroups(normalizedProduct);
  const normalAttributes =
    selectedVariant?.attributes.filter((attribute) => attribute.specialType == null) ?? [];
  const selectedColor = getVariantSpecialValue(selectedVariant, "COLOR");
  const selectedFinishKey = getVariantFinishKey(
    selectedVariant,
    normalizedProduct.finishReferences,
  );
  const hasSpecialAttributes = colorOptions.length > 0 || finishOptions.length > 0;
  const shouldShowVariantRail = normalizedProduct.variants.length > 1;

  if (!selectedVariant) {
    return null;
  }

  const selectVariant = (variantId: number) => {
    setSelectedVariantId(variantId);
  };

  const handleColorSelect = (colorKey: string) => {
    const targetVariant =
      findVariantBySpecialValues(normalizedProduct.variants, normalizedProduct.finishReferences, {
        colorKey,
        finishKey: selectedFinishKey,
      }) ??
      findVariantBySpecialValues(normalizedProduct.variants, normalizedProduct.finishReferences, {
        colorKey,
      });

    if (targetVariant) {
      selectVariant(targetVariant.id);
    }
  };

  const handleFinishSelect = (finishKey: string) => {
    const targetVariant =
      findVariantBySpecialValues(normalizedProduct.variants, normalizedProduct.finishReferences, {
        colorKey: selectedColor?.key ?? null,
        finishKey,
      }) ??
      findVariantBySpecialValues(normalizedProduct.variants, normalizedProduct.finishReferences, {
        finishKey,
      });

    if (targetVariant) {
      selectVariant(targetVariant.id);
    }
  };

  const handleNormalAttributeSelect = (attributeId: string, valueKey: string) => {
    const targetVariant = findVariantByNormalAttribute(
      normalizedProduct.variants,
      attributeId,
      valueKey,
    );

    if (targetVariant) {
      selectVariant(targetVariant.id);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="grid gap-12 lg:grid-cols-[600px_1fr]">
          <Carousel
            key={`${selectedVariant.id}-${selectedMedia.map((media) => media.id).join("-")}`}
            media={selectedMedia}
            title={selectedVariant.displayName}
          />

          <div className="space-y-10 lg:pl-10">
            <div className="border-cobam-quill-grey/30 border-b pb-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="space-y-5">
                    <Title title={selectedVariant.displayName} />

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                      <Property name="SKU" value={selectedVariant.sku} isCopiable />
                      <BrandTooltip brand={normalizedProduct.brand} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <ProductDevisDialog
                        productName={selectedVariant.displayName}
                        sku={selectedVariant.sku}
                      />
                      {selectedVariant.datasheet ? (
                        <DatasheetLink url={selectedVariant.datasheet.url} />
                      ) : null}
                      {selectedVariant.certificate ? (
                        <DatasheetLink
                          url={selectedVariant.certificate.url}
                          label="Certificat"
                          fallbackFilename="certificat.pdf"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>

                {hasSpecialAttributes ? (
                  <div className="space-y-5">
                    <ColorsList
                      activeKey={selectedColor?.key}
                      colors={colorOptions}
                      onSelect={handleColorSelect}
                    />
                    <FinishesList
                      activeKey={selectedFinishKey ?? undefined}
                      finishes={finishOptions}
                      onSelect={handleFinishSelect}
                    />
                  </div>
                ) : null}

                <RichDescription description={selectedVariant.description} />
              </div>
            </div>

            {shouldShowVariantRail && normalAttributeGroups.length > 0 ? (
              <div className="border-cobam-quill-grey/30 border-b pb-8">
                <div className="space-y-5">
                  {normalAttributeGroups.map((group) => {
                    const selectedValue = getVariantAttributeValue(
                      selectedVariant,
                      group.attributeId,
                    );
                    const selectedKey =
                      selectedValue != null ? normalizeComparableValue(selectedValue.value) : null;

                    return (
                      <div key={group.attributeId} className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm text-slate-500">{group.name}</p>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {group.options.map((option) => (
                            <SelectorPill
                              key={`${group.attributeId}-${option.key}`}
                              label={option.label}
                              unit={group.unit}
                              active={selectedKey === option.key}
                              onClick={() =>
                                handleNormalAttributeSelect(group.attributeId, option.key)
                              }
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {normalAttributes.length > 0 ? (
              <NormalAttributesList normalAttributes={normalAttributes} />
            ) : null}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
