import PanelField from "../ui/PanelField";
import PanelInput from "../ui/PanelInput";

interface Props {
  id: string;
  label?: string;
  value: string;
  priceUnitSymbol: string;
  onChange: (value: string) => void;
}

export default function ProductPriceField({
  id,
  label = "Prix de base",
  value,
  priceUnitSymbol,
  onChange,
}: Props) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-300 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <PanelField id={id} label={label}>
        <PanelInput
          id={id}
          fullWidth
          type="number"
          inputMode="decimal"
          step="0.001"
          min="0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Prix de base"
        />
      </PanelField>

      <div className="flex h-10 items-center text-sm font-medium text-slate-500">{`TND / ${priceUnitSymbol}`}</div>
    </div>
  );
}
