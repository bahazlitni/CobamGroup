import type { PublicProductInspectorAttribute } from "@/features/products/types";
import { buildNormalAttributeDisplayGroups } from "./utils";

export default function NormalAttributesList({
  normalAttributes,
}: {
  normalAttributes: PublicProductInspectorAttribute[];
}) {
  const groups = buildNormalAttributeDisplayGroups(normalAttributes);

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section
          key={group.key}
          className="border-cobam-quill-grey/40 rounded-[1.25rem] border bg-white p-5 shadow-sm"
        >
          <h2 className="text-cobam-dark-blue mb-4 text-sm font-semibold tracking-[0.18em] uppercase">
            {group.name}
          </h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            {group.attributes.map((attribute) => (
              <div
                key={`${group.key}-${attribute.attributeId}-${attribute.value}`}
                className="rounded-xl bg-slate-50 px-4 py-3"
              >
                <dt className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
                  {attribute.name}
                </dt>
                <dd className="text-cobam-dark-blue mt-1 flex flex-wrap items-baseline gap-1 text-sm font-semibold">
                  <span>{attribute.value}</span>
                  {attribute.unit ? (
                    <span className="text-xs font-medium text-slate-500">{attribute.unit}</span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
