import React from 'react';
import { render } from '@testing-library/react';

import EditorToolbar from '../EditorToolbar';

describe('RichTextEditor', () => {
  it('renders', () => {
    const { asFragment } = render(<EditorToolbar />);

    expect(asFragment()).toMatchSnapshot();
  });
});
