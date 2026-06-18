import type { AnyExtension } from "@tiptap/core";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ArticleImageNodeView from "./article-image-node-view";

const BaseArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      mediaId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-media-id"),
        renderHTML: (attributes) => {
          if (!attributes.mediaId) {
            return {};
          }

          return {
            "data-media-id": String(attributes.mediaId),
          };
        },
      },
    };
  },
});

const ArticleImageWithAltEditor = BaseArticleImage.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ArticleImageNodeView);
  },
});

const articleImageOptions = {
  allowBase64: true,
  HTMLAttributes: {
    loading: "lazy",
    decoding: "async",
  },
};

type ArticleEditorExtensionsOptions = {
  placeholder?: string;
  enableImageAltEditor?: boolean;
  features?: ArticleRichTextEditorFeatures;
};

export type ArticleRichTextEditorFeatures = {
  headings: boolean;
  lists: boolean;
  blockquote: boolean;
  horizontalRule: boolean;
  tables: boolean;
  images: boolean;
  links: boolean;
  colors: boolean;
};

export const DEFAULT_ARTICLE_RICH_TEXT_FEATURES: ArticleRichTextEditorFeatures = {
  headings: true,
  lists: true,
  blockquote: true,
  horizontalRule: true,
  tables: true,
  images: true,
  links: true,
  colors: true,
};

export const PARAGRAPH_ONLY_ARTICLE_RICH_TEXT_FEATURES: ArticleRichTextEditorFeatures = {
  headings: false,
  lists: false,
  blockquote: false,
  horizontalRule: false,
  tables: false,
  images: false,
  links: true,
  colors: true,
};

export function createArticleEditorExtensions(
  options: ArticleEditorExtensionsOptions = {},
): AnyExtension[] {
  const features = options.features ?? DEFAULT_ARTICLE_RICH_TEXT_FEATURES;
  const extensions: AnyExtension[] = [
    StarterKit.configure({
      heading: features.headings ? { levels: [2, 3, 4, 5, 6] } : false,
      bulletList: features.lists ? undefined : false,
      orderedList: features.lists ? undefined : false,
      listItem: features.lists ? undefined : false,
      blockquote: features.blockquote ? undefined : false,
      horizontalRule: features.horizontalRule ? undefined : false,
      link: false,
      underline: false,
      codeBlock: false,
    }),
    Underline,
  ];

  if (features.links) {
    extensions.push(
      Link.configure({
        openOnClick: false,
        autolink: false,
        linkOnPaste: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "article-link",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    );
  }

  if (features.colors) {
    extensions.push(
      TextStyle,
      Color.configure({
        types: ["textStyle"],
      }),
    );
  }

  if (features.tables) {
    extensions.push(
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    );
  }

  if (features.images) {
    extensions.push(
      (options.enableImageAltEditor ? ArticleImageWithAltEditor : BaseArticleImage).configure(
        articleImageOptions,
      ),
    );
  }

  if (options.placeholder) {
    extensions.push(
      Placeholder.configure({
        placeholder: options.placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    );
  }

  return extensions;
}
