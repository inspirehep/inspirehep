import React from 'react';
import { fromJS } from 'immutable';
import { renderWithProviders } from '../../../fixtures/render';
import InstitutionItem from '../InstitutionItem';

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

    const { asFragment } = renderWithProviders(
      <InstitutionItem metadata={metadata} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with only needed props', () => {
    const metadata = fromJS({
      legacyIcn: 'West Virginia U.',
      control_number: 123,
    });

    const { asFragment } = renderWithProviders(
      <InstitutionItem metadata={metadata} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
