"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ListTree } from "lucide-react";
import Loading from "@/components/staff/Loading";
import { StaffFilterBar, StaffNotice, StaffPageHeader } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canCreateProductCategories } from "@/features/product-categories/access";
import {
  ProductCategoryTree,
  type ProductCategoryTreeNode,
} from "@/features/product-categories/components/product-category-tree";
import { useProductCategoriesTree } from "@/features/product-categories/hooks/use-product-categories-tree";
import type { ProductCategoryListItemDto } from "@/features/product-categories/types";
import { usePathname } from "next/navigation";

function sortCategories(
  left: ProductCategoryListItemDto,
  right: ProductCategoryListItemDto,
) {
  const sortOrderDelta = left.sortOrder - right.sortOrder;

  if (sortOrderDelta !== 0) {
    return sortOrderDelta;
  }

  return left.name.localeCompare(right.name, "fr-FR");
}

function buildCategoryTree(
  items: ProductCategoryListItemDto[],
): ProductCategoryTreeNode[] {
  const sortedItems = [...items].sort(sortCategories);
  const nodes = new Map<number, ProductCategoryTreeNode>(
    sortedItems.map((item) => [item.id, { ...item, children: [] }]),
  );
  const roots: ProductCategoryTreeNode[] = [];

  for (const item of sortedItems) {
    const node = nodes.get(item.id);

    if (!node) {
      continue;
    }

    if (item.parentId != null) {
      const parentNode = nodes.get(item.parentId);

      if (parentNode) {
        parentNode.children.push(node);
        continue;
      }
    }

    roots.push(node);
  }

  const sortTree = (treeNodes: ProductCategoryTreeNode[]) => {
    treeNodes.sort(sortCategories);

    for (const treeNode of treeNodes) {
      if (treeNode.children.length > 0) {
        sortTree(treeNode.children);
      }
    }

    return treeNodes;
  };

  return sortTree(roots);
}

function collectExpandableIds(nodes: ProductCategoryTreeNode[]): number[] {
  const ids: number[] = [];

  for (const node of nodes) {
    if (node.children.length > 0) {
      ids.push(node.id);
      ids.push(...collectExpandableIds(node.children));
    }
  }

  return ids;
}

export default function ProductCategoriesListPage() {
  const { user: authUser } = useStaffSessionContext();
  const canCreateCategory = authUser
    ? canCreateProductCategories(authUser)
    : false;

  const {
    items,
    total,
    search,
    appliedSearch,
    isLoading,
    error,
    setSearch,
    submitSearch,
    clearSearch,
  } = useProductCategoriesTree();

  const tree = useMemo(() => buildCategoryTree(items), [items]);
  const rootCount = tree.length;
  const activeCount = useMemo(
    () => items.filter((item) => item.isActive).length,
    [items],
  );
  const expandableIds = useMemo(() => collectExpandableIds(tree), [tree]);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  useEffect(() => {
    setExpandedIds(expandableIds);
  }, [expandableIds]);

  const expandedIdSet = useMemo(() => new Set(expandedIds), [expandedIds]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitSearch();
  };

  const toggleNode = (categoryId: number) => {
    setExpandedIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  };
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="Categories produit"
        title="Arborescence produit"
        icon={ListTree}
        actions={
          canCreateCategory ? (
            <AnimatedUIButton
              href={`${pathname}/new`}
              variant="secondary"
              icon="plus"
            >
              Créer une catégorie
            </AnimatedUIButton>
          ) : null
        }
      />

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8">
          <Loading />
        </div>
      ) : null}

      {!isLoading && error ? (
        <StaffNotice variant="error" title="Chargement impossible">
          {error}
        </StaffNotice>
      ) : null}

      {!isLoading && !error && tree.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
          Aucune categorie ne correspond a ces criteres.
        </div>
      ) : null}

      {!isLoading && !error && tree.length > 0 ? (
          <ProductCategoryTree
            pathname={pathname}
            nodes={tree}
            expandedIds={expandedIdSet}
            onToggle={toggleNode}
          />
      ) : null}
    </div>
  );
}
