import { PublicProductInspectorAttribute } from "@/features/products/types";

export default function NormalAttributesList({normalAttributes}: {normalAttributes: PublicProductInspectorAttribute[]}){
    if(!normalAttributes.length) return null;
    
    return <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 sm:p-8">
        <div className="space-y-4">
        {normalAttributes.map((attribute) => (
            <div
            key={attribute.attributeId}
            className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm"
            >
            <span className="text-slate-500">{attribute.name}</span>
            <span className="font-semibold text-cobam-dark-blue">{attribute.value}</span>
            {attribute.unit ? (
                <span className="text-slate-400">{attribute.unit}</span>
            ) : null}
            </div>
        ))}
        </div>
    </div>
}