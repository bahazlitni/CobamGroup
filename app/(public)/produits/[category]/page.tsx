import PageHeader from "@/components/ui/custom/PageHeader";

import { categoriesData, Category } from "@/data/categories";
import notFound from "@/app/not-found";

function getCategoryData(cat: string): Category | null {
    for(const category of categoriesData) {
        if(category.slug == cat) return category;
    }
    return null;
}

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ category: string }>
}) {
    const { category } = await params;

    const categoryData = getCategoryData(category);


    if(!categoryData || categoryData.parent !== null) return notFound();
    

    return (
        <div className="min-h-screen w-full">
            <PageHeader description={categoryData.descriptionSEO} title={categoryData.title} subtitle="Catégorie"/>
            
        </div>
    );
}