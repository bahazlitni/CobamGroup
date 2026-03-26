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
    params: Promise<{ category: string; subcategory: string }>
}) {
    const { category, subcategory } = await params;
    const categoryData = getCategoryData(category);
    const subcategoryData = getCategoryData(subcategory);

    if(!categoryData || !subcategoryData || subcategoryData.parent !== category) return notFound();
    
    if(!subcategoryData) return notFound();

    return (
        <div className="min-h-screen w-full">
            <PageHeader description={subcategoryData.descriptionSEO} title={subcategoryData.title} subtitle={categoryData.title}/>
            
        </div>
    );
}