import { EditorContent, useEditor } from '@tiptap/react';
import { useState } from 'react';

import './RichTextEditor.less';
import EditorToolbar from './EditorToolbar';
import { editorExtensions } from './editorExtensions';
import LinkBubbleMenu from './LinkBubbleMenu';

interface RichTextEditorProps {
  'data-test-type'?: string;
  'data-test-id'?: string;
  defaultValue?: string;
  onChange?: (content: string) => void;
  onBlur?: () => void;
}

const RichTextEditor = ({
  'data-test-type': dataTestType,
  'data-test-id': dataTestId,
  defaultValue,
  onChange,
  onBlur,
}: RichTextEditorProps) => {
  const [isLinkEditing, setIsLinkEditing] = useState(false);

  const editor = useEditor({
    extensions: editorExtensions,
    content: defaultValue,
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(currentEditor.getHTML());
    },
    onBlur: () => {
      onBlur?.();
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div
      className="__RichTextEditor__ ant-input"
      data-test-type={dataTestType}
      data-test-id={dataTestId}
    >
      <EditorToolbar
        editor={editor}
        onLinkClick={() => setIsLinkEditing(!isLinkEditing)}
      />
      <EditorContent editor={editor} className="content" />
      <LinkBubbleMenu
        editor={editor}
        isEditing={isLinkEditing}
        setIsEditing={setIsLinkEditing}
      />
    </div>
  );
};

export default RichTextEditor;
