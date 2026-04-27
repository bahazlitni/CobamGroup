import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { ProductCommercialMode } from "@prisma/client";
import ProductDevisDialog from "./ProductDevisDialog";

function PriceText({
  price,
}: {
  price?: null | number | string;
}) {
  if (price !== 0 && !price) return null;

  let priceFloat: number;

  if (typeof price === "string") {
    priceFloat = parseFloat(price);
    if (Number.isNaN(priceFloat)) return null;
  } else {
    priceFloat = price ?? 0;
  }

  // Fix precision issues by working on integers
  const scaled = Math.trunc(priceFloat * 1000);
  const integerPart = String(Math.trunc(scaled / 1000));
  const decimalPart = String(Math.abs(scaled % 1000)).padStart(3, "0");

  return (
    <div className="flex items-start gap-1 text-cobam-dark-blue">
      <span className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
        {integerPart}
      </span>
      <span className="pt-1 text-lg font-semibold tracking-[-0.03em] text-slate-500">
        ,{decimalPart}
      </span>
      <span className="pt-2 text-sm font-medium text-slate-500">
        DT
      </span>
    </div>
  );
}

function CommercialModeAction({
  commercialMode,
  productName,
  sku,
}: {
  commercialMode: ProductCommercialMode | null;
  productName: string;
  sku: string;
}) {
  if (commercialMode === "ONLINE_ONLY" || commercialMode === "ON_REQUEST_OR_ONLINE") {
    return (
      <AnimatedUIButton size="md" variant="secondary" onClick={() => undefined}>
        Acheter
      </AnimatedUIButton>
    );
  }

  if (commercialMode === "ON_REQUEST_ONLY") {
    return <ProductDevisDialog productName={productName} sku={sku} />;
  }

  return (
    <AnimatedUIButton size="md" variant="light" disabled>
      Produit de reference
    </AnimatedUIButton>
  );
}


interface PriceBannerProps {
  priceVisibility: boolean;
  basePriceAmount: string | null;
  commercialMode: ProductCommercialMode | null;
  productName: string;
  sku: string;
}

export default function PriceBanner({
  priceVisibility,
  basePriceAmount,
  commercialMode,
  productName,
  sku,
}: PriceBannerProps) {
  if (!priceVisibility) {
    return (
      <div className="flex flex-wrap items-center justify-end">
        <CommercialModeAction
          commercialMode={commercialMode}
          productName={productName}
          sku={sku}
        />
      </div>
    );
  }

  return <div className="flex flex-wrap items-end justify-between gap-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          Prix
        </p>
        <PriceText price={basePriceAmount} />
      </div>
      <CommercialModeAction
        commercialMode={commercialMode}
        productName={productName}
        sku={sku}
      />
    </div>
}
