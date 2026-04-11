"use client";

import { useState } from "react";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import Carousel from "./inspector/Carousel";
import BreadCrumb from "./inspector/BreadCrumb";
import Title from "./inspector/Title";
import Property from "./inspector/Property";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { buildColorOptions, buildFinishOptions, buildNormalAttributeGroups, findVariantByNormalAttribute, findVariantBySpecialValues, getVariantAttributeValue, getVariantMedia, getVariantSpecialValue, normalizeComparableValue, normalizeInspectorProduct, PublicProductInspectorViewProps, resolveInitialVariantId, SelectorPillProps } from "./inspector/utils";
import RichDescription from "./inspector/RichDescription";
import SubcategoriesList from "./inspector/SubcategoriesList";
import PriceBanner from "./inspector/PriceBanner";
import VariantRail from "./inspector/VariantsRail";
import ColorsList from "./inspector/ColorsList";
import FinishesList from "./inspector/FinishesList";
import NormalAttributesList from "./inspector/NormalAttributesList";
import DatasheetLink from "./inspector/DatasheetLink";


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
        {label}{unit}
      </button>
  );
}


export default function PublicProductInspectorView({
  product,
  breadcrumb,
}: PublicProductInspectorViewProps) {
  const normalizedProduct = normalizeInspectorProduct(product);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  const selectedVariant =
    normalizedProduct.variants.find(
      (variant) =>
        variant.id === (selectedVariantId ?? resolveInitialVariantId(normalizedProduct)),
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
  const selectedFinish = getVariantSpecialValue(selectedVariant, "FINISH");
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
      findVariantBySpecialValues(normalizedProduct.variants, {
        colorKey,
        finishKey: selectedFinish?.key ?? null,
      }) ??
      findVariantBySpecialValues(normalizedProduct.variants, {
        colorKey,
      });

    if (targetVariant) {
      selectVariant(targetVariant.id);
    }
  };

  const handleFinishSelect = (finishKey: string) => {
    const targetVariant =
      findVariantBySpecialValues(normalizedProduct.variants, {
        colorKey: selectedColor?.key ?? null,
        finishKey,
      }) ??
      findVariantBySpecialValues(normalizedProduct.variants, {
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
      <div className="grid gap-6 lg:grid-cols-[720px_1fr]">
        <Carousel
          key={`${selectedVariant.id}-${selectedMedia.map((media) => media.id).join("-")}`}
          media={selectedMedia}
          title={selectedVariant.name}
        />

        <div className="space-y-10 lg:pl-10">
          <div className="pb-8 border-b border-cobam-quill-grey/30">
            <div className="space-y-6">
              <div className="space-y-3">
                <BreadCrumb
                  categorySlug={breadcrumb?.categorySlug}
                  categoryName={breadcrumb?.categoryName}
                  subcategorySlug={breadcrumb?.subcategorySlug}
                  subcategoryName={breadcrumb?.subcategoryName} 
                />
                <div className="space-y-4">
                  <Title title={selectedVariant.name} />

                  <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                    <Property name="SKU" value={selectedVariant.sku} isCopiable={true} isFemale={false} isPlural={false}/>
                    <Property name="Marque" value={normalizedProduct.brandName} isCopiable={false} isFemale={true} isPlural={true}/>
                    </div>
                    {selectedVariant.datasheet && <DatasheetLink url={selectedVariant.datasheet.url} />}
                  </div>
                </div>
              </div>

              {hasSpecialAttributes ? (
                <div className="space-y-5">
                  <ColorsList activeKey={selectedColor?.key} colors={colorOptions} onSelect={handleColorSelect} />
                  <FinishesList activeKey={selectedFinish?.key} finishes={finishOptions} onSelect={handleFinishSelect} />
                </div>
              ) : null}

              <PriceBanner
                priceVisibility={selectedVariant.priceVisibility} 
                basePriceAmount={selectedVariant.basePriceAmount}
                commercialMode={selectedVariant.commercialMode}
              />
              <RichDescription description={selectedVariant.description}/>
              <SubcategoriesList subcategories={normalizedProduct.subcategories} />
            </div>
          </div>

          {shouldShowVariantRail && normalAttributeGroups.length > 0 ? (
            <div className="pb-8 border-b border-cobam-quill-grey/30">
              <div className="space-y-5">
                {normalAttributeGroups.map((group) => {
                  const selectedValue = getVariantAttributeValue(selectedVariant, group.attributeId);
                  const selectedKey =
                    selectedValue != null
                      ? normalizeComparableValue(selectedValue.value)
                      : null;

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

          {!shouldShowVariantRail && normalAttributes.length > 0 ? (
            <NormalAttributesList normalAttributes={normalAttributes} />
          ) : null}
        </div>
      </div>

      {shouldShowVariantRail && 
        <VariantRail 
          variants={normalizedProduct.variants}
          coverMedia={normalizedProduct.coverMedia}
          selectVariant={selectVariant}
          selectedVariantId={selectedVariant.id}
        />}

      </div>
    </TooltipProvider>
  );
}
