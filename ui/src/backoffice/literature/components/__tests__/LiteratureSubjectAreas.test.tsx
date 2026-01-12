import React from 'react';
import { render, screen } from '@testing-library/react';
import { List, Map } from 'immutable';

import LiteratureSubjectAreas from '../LiteratureSubjectAreas';

describe('LiteratureSubjectAreas component', () => {
  it('renders nothing when categories are missing', () => {
    const { container } = render(
      <LiteratureSubjectAreas categories={undefined} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders each category term as a tag', () => {
    render(
      <LiteratureSubjectAreas
        categories={List([Map({ term: 'hep-th' }), Map({ term: 'math.GT' })])}
      />
    );

    expect(screen.getByText('hep-th')).toBeInTheDocument();
    expect(screen.getByText('math.GT')).toBeInTheDocument();
  });
});
