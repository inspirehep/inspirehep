import React from 'react';
import { shallow } from 'enzyme';

import RequireFeatureFlag from '../RequireFeatureFlag';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('RequireFeatureFlag', () => {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'beforeEach'.
  beforeEach(() => {
    (global as $TSFixMe).CONFIG = {};
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders null if flag is false', () => {
    (global as $TSFixMe).CONFIG = { A_WIP_FEATURE: false };
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2786) FIXME: 'RequireFeatureFlag' cannot be used as a JSX compo... Remove this comment to see the full error message
      <RequireFeatureFlag flag="A_WIP_FEATURE">
        <div>a WIP Feature</div>
      </RequireFeatureFlag>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders null if flag is not set', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2786) FIXME: 'RequireFeatureFlag' cannot be used as a JSX compo... Remove this comment to see the full error message
      <RequireFeatureFlag flag="A_WIP_FEATURE">
        <div>a WIP Feature</div>
      </RequireFeatureFlag>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders whenDisabled if flag is not set and whenDisabled is', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2786) FIXME: 'RequireFeatureFlag' cannot be used as a JSX compo... Remove this comment to see the full error message
      <RequireFeatureFlag
        flag="A_WIP_FEATURE"
        whenDisabled="Almost there, this feature is WIP"
      >
        <div>a WIP Feature</div>
      </RequireFeatureFlag>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders children if flag is set', () => {
    (global as $TSFixMe).CONFIG = { A_WIP_FEATURE: true };
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2786) FIXME: 'RequireFeatureFlag' cannot be used as a JSX compo... Remove this comment to see the full error message
      <RequireFeatureFlag flag="A_WIP_FEATURE">
        <div>a WIP Feature</div>
      </RequireFeatureFlag>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
