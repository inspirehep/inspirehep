import {
  BoldOutlined,
  ClearOutlined,
  ItalicOutlined,
  LinkOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Editor, useEditorState } from '@tiptap/react';
import { editorToolbarStateSelector } from './editorToolbarState';
import styleVariables from '../../../../styleVariables';

const EditorToolbar = ({
  editor,
  onLinkClick,
}: {
  editor: Editor;
  onLinkClick: () => void;
}) => {
  const editorState = useEditorState({
    editor,
    selector: editorToolbarStateSelector,
  });

  const getIconStyle = (isActive: boolean) => {
    const fontStyle = { fontSize: '16px' };
    if (isActive) {
      return { ...fontStyle, color: styleVariables['@primary-color'] };
    }
    return fontStyle;
  };

  return (
    <div className="toolbar">
      <span>
        <button
          type="button"
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldOutlined style={getIconStyle(editorState.isBold)} />
        </button>
        <button
          type="button"
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicOutlined style={getIconStyle(editorState.isItalic)} />
        </button>
      </span>
      <span>
        <button
          type="button"
          title="Numbered List"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <OrderedListOutlined
            style={getIconStyle(editorState.isOrderedList)}
          />
        </button>
        <button
          type="button"
          title="Bulleted List"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <UnorderedListOutlined
            style={getIconStyle(editorState.isBulletList)}
          />
        </button>
      </span>
      <span>
        <button type="button" title="Link" onClick={() => onLinkClick()}>
          <LinkOutlined style={getIconStyle(editorState.isLink)} />
        </button>
      </span>
      <span>
        <button
          type="button"
          title="Clear All Formatting"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        >
          <ClearOutlined style={getIconStyle(false)} />
        </button>
      </span>
    </div>
  );
};

export default EditorToolbar;
