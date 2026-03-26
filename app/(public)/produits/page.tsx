import PageHeader from "@/components/ui/custom/PageHeader";
import ProductExplorer from "@/components/ui/custom/ProductExplorer";
import SectionHeader from "@/components/ui/custom/SectionHeader";
import { categoriesData, productCategoryLinks, productsData } from "@/data/categories";

export default async function CategoryPage() {
    return (
        <section className="py-20">
            <SectionHeader preTitle="Nos Produits" title="Explorez la Richesse" description="Parcourez nos différentes catégories pour trouver les produits qui correspondent à vos besoins spécifiques. Chaque catégorie est soigneusement organisée pour faciliter votre recherche et vous offrir une expérience d'achat agréable." centered titleTextColor="text-cobam-dark-blue" descriptionTextColor="text-gray-700" />
            <ProductExplorer   
                categories = {categoriesData}
                products = {productsData}
                links = {productCategoryLinks}
                hasTopBar={true}
                hasResizeButton={false}
                hasCloseButton={false}
            />
        </section>

    );
}