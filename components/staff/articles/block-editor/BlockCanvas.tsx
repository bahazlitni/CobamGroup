// components/staff/articles/block-editor/BlockCanvas.tsx

"use client";

import { useCallback } from "react";
import type { Block, BlockData, BlockType } from "./block-types";
import { useBlockEditor } from "./use-block-editor";
import { BlockWrapper } from "./BlockWrapper";
import { BlockInserter } from "./BlockInserter";
import { BlockPicker } from "./BlockPicker";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { ParagraphBlock } from "./blocks/ParagraphBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { ListBlock } from "./blocks/ListBlock";
import { TableBlock } from "./blocks/TableBlock";
import { FlexContainerBlock } from "./blocks/FlexContainerBlock";
import { GridContainerBlock } from "./blocks/GridContainerBlock";
import type { HeadingBlockData, ParagraphBlockData, ImageBlockData, ListBlockData, TableBlockData, FlexContainerBlockData, GridContainerBlockData } from "./block-types";

interface BlockCanvasProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  isNested?: boolean;
}

function renderBlockContent(
  block: Block,
  onChange: (data: BlockData) => void
): React.ReactNode {
  const { data } = block;

  if (
    data.type === "h1" ||
    data.type === "h2" ||
    data.type === "h3" ||
    data.type === "h4" ||
    data.type === "h5" ||
    data.type === "h6"
  ) {
    return (
      <HeadingBlock
        data={data as HeadingBlockData}
        onChange={(d) => onChange(d)}
      />
    );
  }

  if (data.type === "p") {
    return (
      <ParagraphBlock
        data={data as ParagraphBlockData}
        onChange={(d) => onChange(d)}
      />
    );
  }

  if (data.type === "image") {
    return (
      <ImageBlock
        data={data as ImageBlockData}
        onChange={(d) => onChange(d)}
      />
    );
  }

  if (data.type === "ol" || data.type === "ul") {
    return (
      <ListBlock
        data={data as ListBlockData}
        onChange={(d) => onChange(d)}
      />
    );
  }

  if (data.type === "table") {
    return (
      <TableBlock
        data={data as TableBlockData}
        onChange={(d) => onChange(d)}
      />
    );
  }

  if (data.type === "flex-container") {
    return (
      <FlexContainerBlock
        data={data as FlexContainerBlockData}
        onChange={(d) => onChange(d)}
      />
    );
  }

  if (data.type === "grid-container") {
    return (
      <GridContainerBlock
        data={data as GridContainerBlockData}
        onChange={(d) => onChange(d)}
      />
    );
  }

  return null;
}

export function BlockCanvas({ blocks, onChange, isNested = false }: BlockCanvasProps) {
  const editor = useBlockEditor(blocks);

  // Sync upward whenever blocks change
  const handleChange = useCallback(
    (updater: (prev: Block[]) => Block[]) => {
      editor.setBlocks((prev) => {
        const next = updater(prev);
        onChange(next);
        return next;
      });
    },
    [editor, onChange]
  );

  const handleInsert = (type: BlockType, afterIndex?: number) => {
    editor.insertBlock(type, afterIndex);
    // propagate after state settles
    setTimeout(() => onChange(editor.blocks), 0);
  };

  const handleUpdate = (id: string, data: BlockData) => {
    editor.updateBlock(id, data);
    setTimeout(() => onChange(editor.blocks), 0);
  };

  const handleRemove = (id: string) => {
    editor.removeBlock(id);
    setTimeout(() => onChange(editor.blocks), 0);
  };

  const handleMove = (id: string, dir: "up" | "down") => {
    editor.moveBlock(id, dir);
    setTimeout(() => onChange(editor.blocks), 0);
  };

  const handleDuplicate = (id: string) => {
    editor.duplicateBlock(id);
    setTimeout(() => onChange(editor.blocks), 0);
  };

  if (editor.blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          {isNested ? "Empty container — add blocks inside" : "Start building your article"}
        </p>
        <BlockPicker
          onInsert={(type) => handleInsert(type, undefined)}
          variant="floating"
        />
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Top inserter */}
      <BlockInserter afterIndex={-1} onInsert={(type, _) => handleInsert(type, undefined)} />

      {editor.blocks.map((block, index) => (
        <div key={block.id}>
          <BlockWrapper
            id={block.id}
            index={index}
            total={editor.blocks.length}
            onMoveUp={() => handleMove(block.id, "up")}
            onMoveDown={() => handleMove(block.id, "down")}
            onDuplicate={() => handleDuplicate(block.id)}
            onRemove={() => handleRemove(block.id)}
            isNested={isNested}
          >
            {renderBlockContent(block, (data) => handleUpdate(block.id, data))}
          </BlockWrapper>

          {/* Inserter between blocks */}
          <BlockInserter
            afterIndex={index}
            onInsert={(type, after) => handleInsert(type, after)}
          />
        </div>
      ))}
    </div>
  );
}