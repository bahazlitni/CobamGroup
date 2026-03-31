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
import StarterKit from "@tiptap/starter-kit";

const ArticleImage = Image.extend({
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
}).configure({
  allowBase64: false,
  HTMLAttributes: {
    loading: "lazy",
    decoding: "async",
  },
});

type ArticleEditorExtensionsOptions = {
  placeholder?: string;
};

export function createArticleEditorExtensions(
  options: ArticleEditorExtensionsOptions = {},
): AnyExtension[] {
  const extensions: AnyExtension[] = [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
    }),
    Underline,
    TextStyle,
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
    Color.configure({
      types: ["textStyle"],
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    ArticleImage,
  ];

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
