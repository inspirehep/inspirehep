import React from 'react';
import { shallow } from 'enzyme';
import ErrorPage from '../ErrorPage';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ErrorPage', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with all props', () => {
    const wrapper = shallow(
      <ErrorPage
        message="Error !"
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        detail={<span>Detail about the error</span>}
        imageSrc="image_src"
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with default detail', () => {
    const wrapper = shallow(
      <ErrorPage message="Error !" imageSrc="image_src" />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
