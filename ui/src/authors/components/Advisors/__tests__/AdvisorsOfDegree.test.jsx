import React from 'react';
import { fromJS } from 'immutable';

import { renderWithRouter } from '../../../../fixtures/render';
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
    const { asFragment } = renderWithRouter(
      <AdvisorsOfDegree advisors={advisors} degreeType="other" />
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
    const { asFragment } = renderWithRouter(
      <AdvisorsOfDegree advisors={advisors} degreeType="phd" />
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
    const { asFragment } = renderWithRouter(
      <AdvisorsOfDegree advisors={advisors} degreeType="master" />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
