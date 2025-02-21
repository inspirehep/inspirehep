import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SpiresExamples from '../SpiresExamples';

describe('SpiresExamples', () => {
  it('renders', () => {
    const { getByText, getAllByRole } = render(
      <MemoryRouter>
        <SpiresExamples />
      </MemoryRouter>
    );

    expect(getByText('Search by')).toBeInTheDocument();
    expect(getByText('Use operators')).toBeInTheDocument();
    expect(getByText('Example')).toBeInTheDocument();

    expect(getByText('Author name')).toBeInTheDocument();
    expect(getByText('a, au, author, name')).toBeInTheDocument();
    expect(getByText('a witten')).toBeInTheDocument();
    expect(getByText('Title')).toBeInTheDocument();
    expect(getByText('t, title, ti')).toBeInTheDocument();
    expect(getByText('t A First Course in String Theory')).toBeInTheDocument();

    const links = getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/literature?q=a%20witten');
    expect(links[1]).toHaveAttribute(
      'href',
      '/literature?q=t%20A%20First%20Course%20in%20String%20Theory'
    );
  });
});
