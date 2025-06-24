import React from 'react';
import { render } from '@testing-library/react';

import { FulltextSnippet } from '../FulltextSnippet';

describe('FulltextSnippet', () => {
  it('renders', () => {
    const snippet = 'A snippet of <em>fulltext</em>';

    const { asFragment } = render(<FulltextSnippet snippet={snippet} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
