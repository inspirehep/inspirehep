import { PluginKey } from '@tiptap/pm/state';
import { Editor, useEditorState } from '@tiptap/react';
// The `node` eslint resolver can't follow package.json "exports" subpaths;
// the long term fix would be to update the eslint config to add eslint-import-resolver-typescript
// eslint-disable-next-line import/no-unresolved
import { BubbleMenu } from '@tiptap/react/menus';
import { Button, Input } from 'antd';
import type { InputRef } from 'antd';
import { useCallback, useEffect, useRef } from 'react';

import { sanitizeUrl } from './sanitizeUrl';
import useLinkHandler from './useLinkHandler';

const LINK_MENU_PLUGIN_KEY = new PluginKey('linkBubbleMenu');

interface LinkBubbleMenuProps {
  editor: Editor;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

const LinkBubbleMenu = ({
  editor,
  isEditing,
  setIsEditing,
}: LinkBubbleMenuProps) => {
  const { isLinkActive } = useEditorState({
    editor,
    selector: (ctx) => ({ isLinkActive: ctx.editor.isActive('link') }),
  });

  const { url, setUrl, setLink, removeLink } = useLinkHandler({
    editor,
    isLinkActive,
    onSetLink: () => setIsEditing(false),
  });

  const inputRef = useRef<InputRef>(null);

  const isVisible = isEditing || isLinkActive;

  useEffect(() => {
    const { view } = editor;
    if (isVisible) {
      view.dispatch(view.state.tr.setMeta(LINK_MENU_PLUGIN_KEY, 'show'));
      view.dispatch(
        view.state.tr.setMeta(LINK_MENU_PLUGIN_KEY, 'updatePosition')
      );
    } else {
      view.dispatch(view.state.tr.setMeta(LINK_MENU_PLUGIN_KEY, 'hide'));
    }
  }, [editor, isVisible]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus({ cursor: 'all' });
    }
  }, [isEditing]);

  const shouldShow = useCallback(() => isVisible, [isVisible]);

  const preventBlur = (event: React.MouseEvent) => event.preventDefault();

  return (
    <BubbleMenu
      editor={editor}
      pluginKey={LINK_MENU_PLUGIN_KEY}
      shouldShow={shouldShow}
      options={{ placement: 'bottom', offset: 8 }}
      className="link-bubble-menu"
    >
      {isEditing ? (
        <div className="link-editor">
          Enter link:
          <Input
            ref={inputRef}
            size="small"
            value={url}
            placeholder="https://example.com"
            onChange={(event) => setUrl(event.target.value)}
            onPressEnter={setLink}
          />
          <Button
            type="link"
            size="small"
            disabled={!url}
            onMouseDown={preventBlur}
            onClick={setLink}
          >
            Save
          </Button>
        </div>
      ) : (
        isLinkActive && (
          <div className="link-preview">
            Visit URL:
            <a
              className="link-preview-url"
              href={sanitizeUrl(url, window.location.href)}
              target="_blank"
              rel="noopener noreferrer"
              title={url}
            >
              {url}
            </a>
            <div>
              <Button
                type="link"
                size="small"
                onMouseDown={preventBlur}
                onClick={() => setIsEditing(true)}
                style={{ borderRight: '1px solid #ccc' }}
              >
                Edit
              </Button>
              <Button
                type="link"
                size="small"
                onMouseDown={preventBlur}
                onClick={removeLink}
              >
                Remove
              </Button>
            </div>
          </div>
        )
      )}
    </BubbleMenu>
  );
};

export default LinkBubbleMenu;
