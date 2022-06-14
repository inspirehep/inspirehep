import React from 'react';
import { shallow } from 'enzyme';

import RequireOneOf from '../RequireOneOf';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('RequireOneOf', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders null if all dependencies are missing', () => {
    const dep1 = null;
    const dep2 = null;
    const wrapper = shallow(
      <RequireOneOf dependencies={[dep1, dep2]}>
        <div>
          I depend on {dep1} and {dep2}
        </div>
      </RequireOneOf>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders children if one dependency is there', () => {
    const dep1 = 'dep1';
    const dep2 = null;
    const wrapper = shallow(
      <RequireOneOf dependencies={[dep1, dep2]}>
        <div>
          I depend on {dep1} and {dep2}
        </div>
      </RequireOneOf>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders null if dependency is an empty string', () => {
    const dep1 = null;
    const dep2 = null;
    const wrapper = shallow(
      <RequireOneOf dependencies={[dep1, dep2]}>
        <div>
          I depend on {dep1} and {dep2}
        </div>
      </RequireOneOf>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders children if dependency is false', () => {
    const dep = false;
    const wrapper = shallow(
      <RequireOneOf dependencies={[dep]}>
        <div>I depend on {dep}</div>
      </RequireOneOf>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders children if dependency is 0', () => {
    const dep = 0;
    const wrapper = shallow(
      <RequireOneOf dependencies={[dep]}>
        <div>I depend on {dep}</div>
      </RequireOneOf>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
