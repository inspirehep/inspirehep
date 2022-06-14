import React from 'react';
import { shallow } from 'enzyme';
import JobStatusAlert from '../JobStatusAlert';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('JobStatusAlert', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not render with status open', () => {
    // @ts-expect-error ts-migrate(2786) FIXME: 'JobStatusAlert' cannot be used as a JSX component... Remove this comment to see the full error message
    const wrapper = shallow(<JobStatusAlert status="open" />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders alert with status pending and correct type and message', () => {
    // @ts-expect-error ts-migrate(2786) FIXME: 'JobStatusAlert' cannot be used as a JSX component... Remove this comment to see the full error message
    const wrapper = shallow(<JobStatusAlert status="pending" />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders alert with status closed and correct type and message', () => {
    // @ts-expect-error ts-migrate(2786) FIXME: 'JobStatusAlert' cannot be used as a JSX component... Remove this comment to see the full error message
    const wrapper = shallow(<JobStatusAlert status="closed" />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
