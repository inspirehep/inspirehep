import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import InstitutionItem from '../InstitutionItem';
import { getStore } from '../../../fixtures/store';

describe('InstitutionItem', () => {
  it('renders with all props set', () => {
    const metadata = fromJS({
      legacyIcn: 'West Virginia U.',
      addresses: [
        {
          cities: ['Liverpool'],
          country_code: 'USA',
          country: 'country',
        },
      ],
      urls: [{ value: 'http://url.com' }],
      control_number: 1234,
      institution_hierarchy: [
        {
          name: 'Department of Physics',
        },
      ],
      number_of_papers: 1,
    });

    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <InstitutionItem metadata={metadata} />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with only needed props', () => {
    const metadata = fromJS({
      legacyIcn: 'West Virginia U.',
      control_number: 123,
    });

    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <InstitutionItem metadata={metadata} />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
