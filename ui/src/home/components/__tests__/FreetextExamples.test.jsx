import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FreetextExamples from '../FreetextExamples';

describe('FreetextExamples', () => {
  it('renders', () => {
    const { getByRole } = render(
      <MemoryRouter>
        <FreetextExamples />
      </MemoryRouter>
    );

    expect(getByRole('link', { name: /1207.7214/i })).toHaveAttribute(
      'href',
      '/literature?q=1207.7214'
    );
  });
});
