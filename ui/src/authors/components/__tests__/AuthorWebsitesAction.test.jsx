import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AuthorWebsitesAction from '../AuthorWebsitesAction';

describe('AuthorWebsitesAction', () => {
  it('renders with a blog and urls in a dropdown', () => {
    const websites = fromJS([
      { description: 'Whatever', value: 'https://www.whatever.com/author' },
      { description: 'BLOG', value: 'https://author.wordpress.com' },
      { value: 'www.descriptionless.com/url' },
    ]);
    const wrapper = shallow(<AuthorWebsitesAction websites={websites} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only blog', () => {
    const websites = fromJS([
      { description: 'blog', value: 'https://author.wordpress.com' },
    ]);
    const wrapper = shallow(<AuthorWebsitesAction websites={websites} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only a url', () => {
    const websites = fromJS([{ value: 'www.descriptionless.com/url' }]);
    const wrapper = shallow(<AuthorWebsitesAction websites={websites} />);
    expect(wrapper).toMatchSnapshot();
  });
});
