import React from 'react';
import { shallow } from 'enzyme';

import Header from '../Header';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Header', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with search box if it is not on home or submission', () => {
    const wrapper = shallow(
      <Header
        isSubmissionsPage={false}
        isHomePage={false}
        isBetaPage={false}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders without search box if it is on homepage `/`', () => {
    const wrapper = shallow(
      <Header
        isSubmissionsPage={false}
        isHomePage
        isBetaPage={false}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders without search box if it is on submission page', () => {
    const wrapper = shallow(
      <Header
        isSubmissionsPage
        isHomePage={false}
        isBetaPage={false}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with Banner and Ribbon if it is on beta page', () => {
    const wrapper = shallow(
      <Header
        isSubmissionsPage={false}
        isHomePage={false}
        isBetaPage
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
