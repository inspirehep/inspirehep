import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { MemoryRouter } from 'react-router-dom';
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
    const { asFragment } = render(
      <MemoryRouter>
        <Advisors advisors={advisors} />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
