import { render } from '@testing-library/react';
import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';

import EditorToolbar from '../EditorToolbar';

function EditorToolbarWithEditor() {
  const editor = useEditor({ extensions: [StarterKit] });

  if (!editor) {
    return null;
  }

  return <EditorToolbar editor={editor} />;
}

describe('EditorToolbar', () => {
  it('renders', () => {
    const { asFragment } = render(<EditorToolbarWithEditor />);

    expect(asFragment()).toMatchSnapshot();
  });
});
