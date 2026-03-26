import { ReactNode } from "react";
import PanelTitle from "./PanelTitle";

export default function Panel({pretitle="", title, description="", children}: {
    pretitle: string; title: string; description?:string; children: ReactNode[] | ReactNode
}){
    return (
        <aside className="space-y-5">
            <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                <PanelTitle pretitle={pretitle} title={title} description={description} />
                <div className="space-y-5 p-5 sm:p-6">
                    {children}
                </div>
            </section>
        </aside>
    );
}