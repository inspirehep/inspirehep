import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AuthorWebsitesAction from '../AuthorWebsitesAction';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AuthorWebsitesAction', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with a blog and urls in a dropdown', () => {
    const websites = fromJS([
      { description: 'Whatever', value: 'https://www.whatever.com/author' },
      { description: 'BLOG', value: 'https://author.wordpress.com' },
      { value: 'www.descriptionless.com/url' },
    ]);
    const wrapper = shallow(<AuthorWebsitesAction websites={websites} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders only blog', () => {
    const websites = fromJS([
      { description: 'blog', value: 'https://author.wordpress.com' },
    ]);
    const wrapper = shallow(<AuthorWebsitesAction websites={websites} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders only a url', () => {
    const websites = fromJS([{ value: 'www.descriptionless.com/url' }]);
    const wrapper = shallow(<AuthorWebsitesAction websites={websites} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
