import { Editor } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';

function useLinkHandler({
  editor,
  onSetLink,
  isLinkActive,
}: {
  editor: Editor;
  onSetLink: () => void;
  isLinkActive: boolean;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const { href } = editor.getAttributes('link');

    if (isLinkActive && url === null) {
      setUrl(href || '');
    }
  }, [editor, isLinkActive, url]);

  useEffect(() => {
    const updateLinkState = () => {
      const { href } = editor.getAttributes('link');
      setUrl(href || '');
    };

    editor.on('selectionUpdate', updateLinkState);
    return () => {
      editor.off('selectionUpdate', updateLinkState);
    };
  }, [editor]);

  const setLink = useCallback(() => {
    if (!url || !editor) return;

    const { selection } = editor.state;
    const isEmpty = selection.empty;

    let chain = editor.chain().focus();

    chain = chain.extendMarkRange('link').setLink({ href: url });

    if (isEmpty && !isLinkActive) {
      chain = chain.insertContent({ type: 'text', text: url });
    }

    chain.run();

    setUrl(null);

    onSetLink();
  }, [editor, isLinkActive, onSetLink, url]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .unsetLink()
      .setMeta('preventAutolink', true)
      .run();
    setUrl('');
  }, [editor]);

  return {
    url: url || '',
    setUrl,
    setLink,
    removeLink,
  };
}

export default useLinkHandler;
