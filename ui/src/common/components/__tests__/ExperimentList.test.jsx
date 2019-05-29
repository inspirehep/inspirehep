import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ExperimentList from '../ExperimentList';

describe('ExperimentList', () => {
  it('renders arxiv categories', () => {
    const experiments = fromJS([
      { name: 'CERN-LHC-CMS' },
      { name: 'CERN-LHC-LHCb' },
    ]);
    const wrapper = shallow(<ExperimentList experiments={experiments} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
