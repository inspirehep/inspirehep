import React from 'react';
import { shallow } from 'enzyme';

import SubContentBox from '../SubContentBox';

describe('SubContentBox', () => {
  it('renders with all props', () => {
    const wrapper = shallow(
      <SubContentBox title="Box">
        <div>Lots of content</div>
      </SubContentBox>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without title', () => {
    const wrapper = shallow(
      <SubContentBox>
        <div>Lots of content</div>
      </SubContentBox>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render SubContentBox without children', () => {
    const wrapper = shallow(<SubContentBox title="Empty Box" />);
    expect(wrapper).toMatchSnapshot();
  });
});
