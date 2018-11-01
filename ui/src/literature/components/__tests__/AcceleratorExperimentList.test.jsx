import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AcceleratorExperimentList from '../AcceleratorExperimentList';

describe('AcceleratorExperimentList', () => {
  it('renders with accelerator experiments', () => {
    const acceleratorExperiments = fromJS([
      {
        name: 'CERN-LHC-CMS',
      },
      {
        name: 'FNAL-123-456',
      },
    ]);
    const wrapper = shallow(
      <AcceleratorExperimentList
        acceleratorExperiments={acceleratorExperiments}
      />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
