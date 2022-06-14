import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import { Alert } from 'antd';

import Banner from '../Banner';

describe('Banner', () => {
  it('renders when it is not closed', () => {
    const wrapper = shallow(
      <Banner
        id="release-04.2020"
        message="<strong>Welcome to the new INSPIRE! <a href=&quot;/release&quot;>learn more</a></strong>"
        closedBannersById={fromJS({})}
        currentPathname="/"
        onClose={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render when it is closed', () => {
    const wrapper = shallow(
      <Banner
        id="release-04.2020"
        message="<strong>Welcome to the new INSPIRE! <a href=&quot;/release&quot;>learn more</a></strong>"
        closedBannersById={fromJS({ 'release-04.2020': true })}
        currentPathname="/"
        onClose={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders when pathname is a match', () => {
    const wrapper = shallow(
      <Banner
        id="release-feature-04.2020"
        message="We have a new literature feature"
        pathnameRegexp={/^\/literature/}
        closedBannersById={fromJS({})}
        currentPathname="/literature/12345"
        onClose={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render when pathname is not a match', () => {
    const wrapper = shallow(
      <Banner
        id="release-feature-04.2020"
        message="We have a new feature"
        pathnameRegexp={/^\/new-feature-page/}
        closedBannersById={fromJS({})}
        currentPathname="/literature/12345"
        onClose={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

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
        onClose={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onClose with id, after Alert close', () => {
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
    afterClose();

    expect(onClose).toHaveBeenCalledWith('test');
  });
});
