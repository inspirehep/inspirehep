import React from 'react';
import { shallow } from 'enzyme';

import ExperimentForm from '../ExperimentForm';

describe('ExperimentForm', () => {
  it('renders', () => {
    const wrapper = shallow(
      <ExperimentForm />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
