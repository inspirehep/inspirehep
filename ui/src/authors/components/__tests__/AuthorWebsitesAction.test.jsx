import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import AuthorWebsitesAction from '../AuthorWebsitesAction';

describe('AuthorWebsitesAction', () => {
  it('renders with a blog and urls in a dropdown', () => {
    const websites = fromJS([
      { description: 'Whatever', value: 'https://www.whatever.com/author' },
      { description: 'BLOG', value: 'https://author.wordpress.com' },
      { value: 'www.descriptionless.com/url' },
    ]);
    const { asFragment } = render(<AuthorWebsitesAction websites={websites} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders only blog', () => {
    const websites = fromJS([
      { description: 'blog', value: 'https://author.wordpress.com' },
    ]);
    const { asFragment } = render(<AuthorWebsitesAction websites={websites} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders only a url', () => {
    const websites = fromJS([{ value: 'www.descriptionless.com/url' }]);
    const { asFragment } = render(<AuthorWebsitesAction websites={websites} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
