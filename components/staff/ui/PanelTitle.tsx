export default function PanelTitle(
    {pretitle="", title, description=""}: {pretitle: string; title: string; description?:string;}
){
    return (title && 
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            {pretitle && <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cobam-water-blue">
                {pretitle}
            </p>}
            <h2 className="mt-1 text-base font-semibold text-cobam-dark-blue">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
    );
}