import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import MoreInfo from '../MoreInfo';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('MoreInfo', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with urls', () => {
    const urls = fromJS([
      {
        value: 'url1',
      },
      {
        value: 'url2',
      },
    ]);
    const wrapper = shallow(<MoreInfo urls={urls} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
