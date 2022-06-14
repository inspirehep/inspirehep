import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import AuthorWithBAI from '../AuthorWithBAI';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AuthorWithBAI', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      bai: 'Name.Full.1',
    });
    const wrapper = shallow(<AuthorWithBAI author={author} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
