import React from 'react';
import { shallow } from 'enzyme';

import NumberOfPages from '../NumberOfPages';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('NumberOfPages', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with number of pages', () => {
    const numberOfPages = 100;
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<NumberOfPages numberOfPages={numberOfPages} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders empty if null', () => {
    const wrapper = shallow(<NumberOfPages />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('display `page` if number_of_pages is 1', () => {
    const numberOfPages = 1;
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<NumberOfPages numberOfPages={numberOfPages} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
