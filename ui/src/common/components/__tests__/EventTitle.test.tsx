import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import EventTitle from '../EventTitle';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('EventTitle', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only title', () => {
    const title = fromJS({ title: 'Conference Title' });
    const wrapper = shallow(<EventTitle title={title} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with also subtitle', () => {
    const title = fromJS({ title: 'Conference Title', subtitle: 'Sub' });
    const wrapper = shallow(<EventTitle title={title} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with everything', () => {
    const title = fromJS({ title: 'Conference Title', subtitle: 'Sub' });
    const acronym = 'CTest';
    const wrapper = shallow(<EventTitle title={title} acronym={acronym} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
