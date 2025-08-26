import React from 'react';
import { fromJS } from 'immutable';

import { renderWithRouter } from '../../../../fixtures/render';
import Advisors from '../Advisors';

describe('Advisors', () => {
  it('renders advisors', () => {
    const advisors = fromJS([
      {
        name: 'Degreeless Advisor',
      },
      {
        name: 'Other Advisor',
        degree_type: 'other',
      },
      {
        name: 'Master Advisor',
        degree_type: 'master',
      },
      {
        name: 'PhD Advisor',
        degree_type: 'phd',
      },
      {
        name: 'Another PhD Advisor',
        degree_type: 'phd',
      },
    ]);
    const { asFragment } = renderWithRouter(<Advisors advisors={advisors} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
