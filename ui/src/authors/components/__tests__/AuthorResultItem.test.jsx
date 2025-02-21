import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import { MemoryRouter } from 'react-router-dom';
import AuthorResultItem from '../AuthorResultItem';

describe('AuthorResultItem', () => {
  it('renders with only name', () => {
    const metadata = fromJS({
      can_edit: false,
      name: { value: 'Urhan, Harun' },
      control_number: 12345,
    });
    const { asFragment } = render(
      <MemoryRouter>
        <AuthorResultItem metadata={metadata} />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders full author result', () => {
    const metadata = fromJS({
      can_edit: true,
      name: { value: 'Urhan, Harun' },
      control_number: 12345,
      project_membership: [{ name: 'CERN-LHC-CMS' }],
      positions: [
        { institution: 'CERN', current: 'true' },
        { institution: 'CERN2' },
        { institution: 'CERN3', current: 'true' },
      ],
      arxiv_categories: ['hep-th'],
      urls: [{ value: 'https://cern.ch/1' }],
    });
    const { asFragment } = render(
      <MemoryRouter>
        <AuthorResultItem metadata={metadata} />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
