import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import WebsitesAction from '../WebsitesAction';

describe('WebsitesAction', () => {
  it('renders urls with and without description', () => {
    const websites = fromJS([
      { description: 'Whatever', value: 'https://www.whatever.com/conference' },
      { value: 'www.descriptionless.com/url' },
    ]);
    const wrapper = shallow(<WebsitesAction websites={websites} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders single url', () => {
    const websites = fromJS([
      { description: 'blog', value: 'https://author.wordpress.com' },
    ]);
    const wrapper = shallow(<WebsitesAction websites={websites} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
