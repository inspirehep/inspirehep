import type { Editor } from '@tiptap/core';
import type { EditorStateSnapshot } from '@tiptap/react';

export function editorToolbarStateSelector(ctx: EditorStateSnapshot<Editor>) {
  return {
    isBold: ctx.editor.isActive('bold'),
    isItalic: ctx.editor.isActive('italic'),
    isBulletList: ctx.editor.isActive('bulletList'),
    isOrderedList: ctx.editor.isActive('orderedList'),
    isLink: ctx.editor.isActive('link'),
  };
}

export type EditorToolbarState = ReturnType<typeof editorToolbarStateSelector>;
