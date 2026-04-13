import { ProductStockUnit } from "@prisma/client";

interface StockTextProps {
  stock: string | null;
  stockUnit: ProductStockUnit | null;
  stockVisibility: boolean;
}

function formatStockUnit(unit: ProductStockUnit | null): string {
  switch (unit) {
    case "ITEM":
      return "uni.";
    case "KILOGRAM":
      return "kg";
    case "LITER":
      return "L";
    case "CUBIC_METER":
      return "m³";
    case "METER":
      return "m";
    case "SQUARE_METER":
      return "m²";
    default:
      return "";
  }
}

export default function StockText({ stock, stockUnit, stockVisibility }: StockTextProps) {
  if (!stockVisibility || stock === null) return null;

  const stockValue = parseFloat(stock);
  if (isNaN(stockValue)) return null;

  const isOutOfStock = stockValue <= 0;

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${isOutOfStock ? "bg-red-500" : "bg-emerald-500"}`} />
      <span className="text-[13px] font-medium text-slate-600">
        {isOutOfStock ? (
          "Rupture de stock"
        ) : (
          <>
            En stock: <span className="font-bold text-cobam-dark-blue">{stockValue}</span>{" "}
            <span className="text-xs text-slate-400">{formatStockUnit(stockUnit)}</span>
          </>
        )}
      </span>
    </div>
  );
}