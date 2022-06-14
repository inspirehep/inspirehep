import React from 'react';
import { shallow } from 'enzyme';

import RequireFeatureFlag from '../RequireFeatureFlag';

describe('RequireFeatureFlag', () => {
  beforeEach(() => {
    global.CONFIG = {};
  });

  it('renders null if flag is false', () => {
    global.CONFIG = { A_WIP_FEATURE: false };
    const wrapper = shallow(
      <RequireFeatureFlag flag="A_WIP_FEATURE">
        <div>a WIP Feature</div>
      </RequireFeatureFlag>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders null if flag is not set', () => {
    const wrapper = shallow(
      <RequireFeatureFlag flag="A_WIP_FEATURE">
        <div>a WIP Feature</div>
      </RequireFeatureFlag>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders whenDisabled if flag is not set and whenDisabled is', () => {
    const wrapper = shallow(
      <RequireFeatureFlag
        flag="A_WIP_FEATURE"
        whenDisabled="Almost there, this feature is WIP"
      >
        <div>a WIP Feature</div>
      </RequireFeatureFlag>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders children if flag is set', () => {
    global.CONFIG = { A_WIP_FEATURE: true };
    const wrapper = shallow(
      <RequireFeatureFlag flag="A_WIP_FEATURE">
        <div>a WIP Feature</div>
      </RequireFeatureFlag>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
