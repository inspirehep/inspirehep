import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ReferenceList from '../ReferenceList';

describe('ReferenceList', () => {
  it('renders with references', () => {
    const references = fromJS([
      {
        titles: [{ title: 'Reference 1' }],
      },
      {
        titles: [{ title: 'Reference 2' }],
      },
    ]);
    const wrapper = shallow(<ReferenceList references={references} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders as loading if set', () => {
    const references = fromJS([]);
    const wrapper = shallow(<ReferenceList loading references={references} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render without references', () => {
    const wrapper = shallow(<ReferenceList />);
    expect(wrapper).toMatchSnapshot();
  });
});
