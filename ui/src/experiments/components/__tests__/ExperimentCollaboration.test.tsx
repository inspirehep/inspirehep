import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ExperimentCollaboration from '../ExperimentCollaboration';

describe('ExperimentCollaboration', () => {
  it('renders', () => {
    const wrapper = shallow(
      <ExperimentCollaboration collaboration={fromJS({ value: 'Atlas' })} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
