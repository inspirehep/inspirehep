import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import { MemoryRouter } from 'react-router-dom';
import AdvisorsOfDegree from '../AdvisorsOfDegree';

describe('AdvisorsOfDegree', () => {
  it('renders other advisors', () => {
    const advisors = fromJS([
      {
        name: 'Yoda',
      },
      {
        name: 'Another Dude',
        degree_type: 'other',
      },
    ]);
    const { asFragment } = render(
      <MemoryRouter>
        <AdvisorsOfDegree advisors={advisors} degreeType="other" />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders phd advisors', () => {
    const advisors = fromJS([
      {
        name: 'Yoda',
        degree_type: 'phd',
      },
      {
        name: 'Another Dude',
        degree_type: 'phd',
      },
    ]);
    const { asFragment } = render(
      <MemoryRouter>
        <AdvisorsOfDegree advisors={advisors} degreeType="phd" />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders the master advisor', () => {
    const advisors = fromJS([
      {
        name: 'Yoda',
        degree_type: 'master',
      },
    ]);
    const { asFragment } = render(
      <MemoryRouter>
        <AdvisorsOfDegree advisors={advisors} degreeType="master" />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
