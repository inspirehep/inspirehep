import React from 'react';
import { render } from '@testing-library/react';

import RichTextEditor from '../RichTextEditor';

describe('RichTextEditor', () => {
  it('renders', () => {
    const { asFragment } = render(<RichTextEditor onChange={jest.fn()} />);

    expect(asFragment()).toMatchSnapshot();
  });
});
