import React from 'react';
import { render } from '@testing-library/react';

import AuthorOrcid from '../AuthorOrcid';

describe('AuthorOrcid', () => {
  it('renders with orcid', () => {
    const orcid = '0000-0001-8058-0014';
    const { asFragment } = render(<AuthorOrcid orcid={orcid} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
