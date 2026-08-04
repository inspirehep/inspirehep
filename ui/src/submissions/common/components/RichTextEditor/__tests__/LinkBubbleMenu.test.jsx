import { render, screen } from '@testing-library/react';
import { EditorContent, useEditor } from '@tiptap/react';
import { forwardRef, useImperativeHandle, useState, act } from 'react';

import userEvent from '@testing-library/user-event';
import { editorExtensions } from '../editorExtensions';
import LinkBubbleMenu from '../LinkBubbleMenu';

beforeAll(() => {
  Range.prototype.getClientRects = () =>
    Object.assign([], { item: () => null });
  Range.prototype.getBoundingClientRect = () => ({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
  });
});

const LinkBubbleMenuWithEditor = forwardRef(
  ({ content, initialIsEditing = false, onChange }, ref) => {
    const [isEditing, setIsEditing] = useState(initialIsEditing);

    const editor = useEditor({
      extensions: editorExtensions,
      content,
      onUpdate: ({ editor: currentEditor }) =>
        onChange?.(currentEditor.getHTML()),
    });

    useImperativeHandle(ref, () => editor, [editor]);

    if (!editor) {
      return null;
    }

    return (
      <div>
        <EditorContent editor={editor} />
        <LinkBubbleMenu
          editor={editor}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      </div>
    );
  }
);
LinkBubbleMenuWithEditor.displayName = 'LinkBubbleMenuWithEditor';

const renderLinkBubbleMenuWithEditor = (content, options = {}) => {
  const ref = { current: null };
  const onChange = jest.fn();
  render(
    <LinkBubbleMenuWithEditor
      content={content}
      onChange={onChange}
      ref={ref}
      {...options}
    />
  );
  return { editor: ref.current };
};

describe('LinkBubbleMenu', () => {
  it('should apply link to selection and close popover on link click then save', async () => {
    const user = userEvent.setup();
    const { editor } = renderLinkBubbleMenuWithEditor('<p>Hello world</p>', {
      initialIsEditing: true,
    });

    await act(() => editor.commands.setTextSelection({ from: 1, to: 6 }));

    await user.type(
      screen.getByPlaceholderText('https://example.com'),
      'https://example.com'
    );
    await user.click(screen.getByText('Save'));

    const link = document.querySelector('.ProseMirror a');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveTextContent('Hello');
    expect(
      screen.queryByPlaceholderText('https://example.com')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('should update an existing link and close popover on link click then update', async () => {
    const user = userEvent.setup();
    const { editor } = renderLinkBubbleMenuWithEditor(
      '<p><a href="https://old.example.com">Hello</a> world</p>'
    );

    await act(() => editor.commands.setTextSelection({ from: 2, to: 2 }));
    await user.click(screen.getByText('Edit'));

    expect(screen.getByPlaceholderText('https://example.com')).toHaveValue(
      'https://old.example.com'
    );

    const input = screen.getByPlaceholderText('https://example.com');
    await user.clear(input);
    await user.type(input, 'https://new.example.com');
    await user.click(screen.getByText('Save'));

    const link = document.querySelector('.ProseMirror a');
    expect(link).toHaveAttribute('href', 'https://new.example.com');
    expect(link).toHaveTextContent('Hello');
    expect(
      screen.queryByPlaceholderText('https://example.com')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('should remove an existing link and close popover on link click then remove', async () => {
    const user = userEvent.setup();
    const { editor } = renderLinkBubbleMenuWithEditor(
      '<p><a href="https://example.com">Hello</a> world</p>'
    );

    await act(() => editor.commands.setTextSelection({ from: 2, to: 2 }));
    await user.click(screen.getByText('Remove'));

    expect(editor.getHTML()).toBe('<p>Hello world</p>');
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });

  it('should visit a link on click', async () => {
    const { editor } = renderLinkBubbleMenuWithEditor(
      '<p><a href="https://example.com/foo">Hello</a> world</p>'
    );

    await act(() => editor.commands.setTextSelection({ from: 2, to: 2 }));

    const link = document.querySelector('.link-preview-url');
    expect(link).toHaveAttribute('href', 'https://example.com/foo');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
