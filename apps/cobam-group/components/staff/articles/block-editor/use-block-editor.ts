"use client";

import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import {
  createBlock,
  type Block,
  type BlockData,
  type BlockType,
} from "./block-types";

function cloneBlockWithFreshIds(block: Block): Block {
  const cloned = structuredClone(block);
  cloned.id = nanoid();

  if (cloned.data.type === "flex-container" || cloned.data.type === "grid-container") {
    cloned.data.children = cloned.data.children.map((child) =>
      cloneBlockWithFreshIds(child),
    );
  }

  return cloned;
}

export function useBlockEditor(initialBlocks: Block[]) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

  return useMemo(
    () => ({
      blocks,
      setBlocks,
      insertBlock(type: BlockType, afterIndex?: number) {
        setBlocks((current) => {
          const next = [...current];
          const block = createBlock(type);

          if (afterIndex == null || afterIndex < 0) {
            next.unshift(block);
            return next;
          }

          next.splice(afterIndex + 1, 0, block);
          return next;
        });
      },
      updateBlock(id: string, data: BlockData) {
        setBlocks((current) =>
          current.map((block) => (block.id === id ? { ...block, data } : block)),
        );
      },
      removeBlock(id: string) {
        setBlocks((current) => current.filter((block) => block.id !== id));
      },
      moveBlock(id: string, direction: "up" | "down") {
        setBlocks((current) => {
          const index = current.findIndex((block) => block.id === id);

          if (index === -1) {
            return current;
          }

          const targetIndex = direction === "up" ? index - 1 : index + 1;

          if (targetIndex < 0 || targetIndex >= current.length) {
            return current;
          }

          const next = [...current];
          const [moved] = next.splice(index, 1);
          next.splice(targetIndex, 0, moved);
          return next;
        });
      },
      duplicateBlock(id: string) {
        setBlocks((current) => {
          const index = current.findIndex((block) => block.id === id);

          if (index === -1) {
            return current;
          }

          const next = [...current];
          next.splice(index + 1, 0, cloneBlockWithFreshIds(current[index]));
          return next;
        });
      },
    }),
    [blocks],
  );
}
