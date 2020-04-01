import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
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
    });

    const wrapper = shallow(<InstitutionItem metadata={metadata} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with only needed props', () => {
    const metadata = fromJS({
      legacyIcn: 'West Virginia U.',
      control_number: 123,
    });

    const wrapper = shallow(<InstitutionItem metadata={metadata} />);
    expect(wrapper).toMatchSnapshot();
  });
});
