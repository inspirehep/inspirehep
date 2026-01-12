import React from 'react';
import { render, screen } from '@testing-library/react';
import { List } from 'immutable';

import AuthorSubjectAreas from '../AuthorSubjectAreas';

describe('AuthorSubjectAreas component', () => {
  it('renders nothing when categories are missing', () => {
    const { container } = render(<AuthorSubjectAreas categories={undefined} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders each category as a tag', () => {
    render(<AuthorSubjectAreas categories={List(['hep-th', 'math.GT'])} />);

    expect(screen.getByText('hep-th')).toBeInTheDocument();
    expect(screen.getByText('math.GT')).toBeInTheDocument();
  });
});
