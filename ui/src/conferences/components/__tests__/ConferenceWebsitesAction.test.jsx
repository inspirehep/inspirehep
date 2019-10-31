import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ConferenceWebsitesAction from '../ConferenceWebsitesAction';

describe('ConferenceWebsitesAction', () => {
  it('renders urls with and without description', () => {
    const websites = fromJS([
      { description: 'Whatever', value: 'https://www.whatever.com/conference' },
      { value: 'www.descriptionless.com/url' },
    ]);
    const wrapper = shallow(<ConferenceWebsitesAction websites={websites} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders single url', () => {
    const websites = fromJS([
      { description: 'blog', value: 'https://author.wordpress.com' },
    ]);
    const wrapper = shallow(<ConferenceWebsitesAction websites={websites} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
