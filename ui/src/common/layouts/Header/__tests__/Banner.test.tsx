import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import { Alert } from 'antd';

import Banner from '../Banner';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Banner', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when it is not closed', () => {
    const wrapper = shallow(
      <Banner
        id="release-04.2020"
        message="<strong>Welcome to the new INSPIRE! <a href=&quot;/release&quot;>learn more</a></strong>"
        closedBannersById={fromJS({})}
        currentPathname="/"
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onClose={jest.fn()}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not render when it is closed', () => {
    const wrapper = shallow(
      <Banner
        id="release-04.2020"
        message="<strong>Welcome to the new INSPIRE! <a href=&quot;/release&quot;>learn more</a></strong>"
        closedBannersById={fromJS({ 'release-04.2020': true })}
        currentPathname="/"
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onClose={jest.fn()}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders when pathname is a match', () => {
    const wrapper = shallow(
      <Banner
        id="release-feature-04.2020"
        message="We have a new literature feature"
        pathnameRegexp={/^\/literature/}
        closedBannersById={fromJS({})}
        currentPathname="/literature/12345"
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onClose={jest.fn()}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not render when pathname is not a match', () => {
    const wrapper = shallow(
      <Banner
        id="release-feature-04.2020"
        message="We have a new feature"
        pathnameRegexp={/^\/new-feature-page/}
        closedBannersById={fromJS({})}
        currentPathname="/literature/12345"
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onClose={jest.fn()}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with custom style', () => {
    const wrapper = shallow(
      <Banner
        id="files-outage-20.04.2020"
        type="warning"
        message="We have problem with our storage."
        closable={false}
        action={{
          name: 'Learn more',
          href: 'https://status.inspirehep.net',
        }}
        center
        closedBannersById={fromJS({})}
        currentPathname="/"
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onClose={jest.fn()}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onClose with id, after Alert close', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onClose = jest.fn();
    const wrapper = shallow(
      <Banner
        id="test"
        message="Test"
        closedBannersById={fromJS({})}
        currentPathname="/"
        onClose={onClose}
      />
    );

    const afterClose = wrapper.find(Alert).prop('afterClose');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    afterClose();

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onClose).toHaveBeenCalledWith('test');
  });
});
