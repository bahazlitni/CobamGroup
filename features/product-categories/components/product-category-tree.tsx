"use client";

import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  Folder,
  FolderOpen,
} from "lucide-react";
import { StaffBadge } from "@/components/staff/ui";
import type { ProductCategoryListItemDto } from "../types";

export type ProductCategoryTreeNode = ProductCategoryListItemDto & {
  children: ProductCategoryTreeNode[];
};

function buildExcerpt(value: string | null, maxLength = 120) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1).trimEnd()}...`;
}

function CategoryTreeRow({
  pathname,
  node,
  depth,
  expandedIds,
  onToggle,
}: {
  pathname: string;
  node: ProductCategoryTreeNode;
  depth: number;
  expandedIds: ReadonlySet<number>;
  onToggle: (categoryId: number) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = hasChildren && expandedIds.has(node.id);
  const excerpt =
    buildExcerpt(node.subtitle) ??
    buildExcerpt(node.description) ??
    buildExcerpt(node.descriptionSeo);
  const hasImage = node.imageMediaId != null;

  return (
    <li className="space-y-2">
      <div
        className="group flex flex-wrap items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-cobam-water-blue/40 hover:bg-slate-50/80"
        style={{ marginLeft: `${depth * 22}px` }}
      >
        <button
          type="button"
          onClick={() => onToggle(node.id)}
          disabled={!hasChildren}
          aria-label={
            hasChildren
              ? isExpanded
                ? `Replier ${node.name}`
                : `Deplier ${node.name}`
              : `Pas de sous-categories pour ${node.name}`
          }
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:border-cobam-water-blue hover:text-cobam-water-blue disabled:cursor-default disabled:opacity-40"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <div className="h-2 w-2 rounded-full bg-slate-300" />
          )}
        </button>

        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cobam-light-bg text-cobam-dark-blue">
            {isExpanded ? (
              <FolderOpen className="h-5 w-5" />
            ) : (
              <Folder className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="truncate font-semibold text-cobam-dark-blue">
              {node.name}
            </div>
            {excerpt ? (
              <div className="text-sm text-slate-500">{excerpt}</div>
            ) : null}
            <div className="truncate text-[11px] text-slate-400">
              {node.slug}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <StaffBadge size="md" color={node.isActive ? "green" : "default"}>
            {node.isActive ? "Active" : "Inactive"}
          </StaffBadge>

          <StaffBadge size="md" color="green" icon="package">
            {node.productModelCount} produit{node.productModelCount > 1 ? "s" : ""}
          </StaffBadge>

          <StaffBadge
            size="md"
            color={hasImage ? "blue" : "default"}
            icon="image"
          >
            {hasImage ? "Image" : "Sans image"}
          </StaffBadge>
        </div>

        <Link
          href={`${pathname}/${node.id}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-cobam-water-blue hover:text-cobam-water-blue"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Voir / Modifier
        </Link>
      </div>

      {isExpanded ? (
        <ul className="space-y-2 border-l border-dashed border-slate-200 pl-2">
          {node.children.map((child) => (
            <CategoryTreeRow
              pathname={pathname}
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function ProductCategoryTree({
  pathname,
  nodes,
  expandedIds,
  onToggle,
}: {
  pathname: string;
  nodes: ProductCategoryTreeNode[];
  expandedIds: ReadonlySet<number>;
  onToggle: (categoryId: number) => void;
}) {
  return (
    <ul className="space-y-3">
      {nodes.map((node) => (
        <CategoryTreeRow
          pathname={pathname}
          key={node.id}
          node={node}
          depth={0}
          expandedIds={expandedIds}
          onToggle={onToggle}
        />
      ))}
    </ul>
  );
}
