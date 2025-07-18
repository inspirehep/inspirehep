import React from 'react';

import { renderWithRouter } from '../../../fixtures/render';
import FreetextExamples from '../FreetextExamples';

describe('FreetextExamples', () => {
  it('renders', () => {
    const { getByRole } = renderWithRouter(<FreetextExamples />);

    expect(getByRole('link', { name: /1207.7214/i })).toHaveAttribute(
      'href',
      '/literature?q=1207.7214'
    );
  });
});
