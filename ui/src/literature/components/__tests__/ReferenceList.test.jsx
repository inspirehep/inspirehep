import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ReferenceList from '../ReferenceList';

describe('ReferenceList', () => {
  it('renders with references', () => {
    const references = fromJS([
      {
        title: 'Reference 1',
      },
      {
        title: 'Reference 2',
      },
    ]);
    const wrapper = shallow(<ReferenceList references={references} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('does not render without references', () => {
    const wrapper = shallow(<ReferenceList />);
    expect(wrapper).toMatchSnapshot();
  });
});
