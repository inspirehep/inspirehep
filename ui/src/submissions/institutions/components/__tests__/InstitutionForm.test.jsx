import React from 'react';
import { shallow } from 'enzyme';

import InstitutionForm from '../InstitutionForm';

describe('InstitutionForm', () => {
  it('renders', () => {
    const wrapper = shallow(
      <InstitutionForm />
    );
    expect(wrapper).toMatchSnapshot();
  });
});