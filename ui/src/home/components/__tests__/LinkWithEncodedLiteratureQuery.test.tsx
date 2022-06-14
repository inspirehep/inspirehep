import React from 'react';
import { shallow } from 'enzyme';
import LinkWithEncodedLiteratureQuery from '../LinkWithEncodedLiteratureQuery';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('LinkWithEncodedLiteratureQuery', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders the component with special characters', () => {
    const query = 'this is an encoded query , / ? : @ & = + $ #';
    const wrapper = shallow(<LinkWithEncodedLiteratureQuery query={query} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders the component without special characters', () => {
    const query = 'this is a query';
    const wrapper = shallow(<LinkWithEncodedLiteratureQuery query={query} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
