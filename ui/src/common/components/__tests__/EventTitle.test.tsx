import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import EventTitle from '../EventTitle';

describe('EventTitle', () => {
  it('renders with only title', () => {
    const title = fromJS({ title: 'Conference Title' });
    const wrapper = shallow(<EventTitle title={title} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with also subtitle', () => {
    const title = fromJS({ title: 'Conference Title', subtitle: 'Sub' });
    const wrapper = shallow(<EventTitle title={title} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with everything', () => {
    const title = fromJS({ title: 'Conference Title', subtitle: 'Sub' });
    const acronym = 'CTest';
    const wrapper = shallow(<EventTitle title={title} acronym={acronym} />);
    expect(wrapper).toMatchSnapshot();
  });
});
