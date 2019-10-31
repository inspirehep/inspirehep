import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ConferenceTitle from '../ConferenceTitle';

describe('ConferenceTitle', () => {
  it('renders with only title', () => {
    const title = fromJS({ title: 'Conference Title' });
    const wrapper = shallow(<ConferenceTitle title={title} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with also subtitle', () => {
    const title = fromJS({ title: 'Conference Title', subtitle: 'Sub' });
    const wrapper = shallow(<ConferenceTitle title={title} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with everything', () => {
    const title = fromJS({ title: 'Conference Title', subtitle: 'Sub' });
    const acronym = 'CTest';
    const wrapper = shallow(
      <ConferenceTitle title={title} acronym={acronym} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
