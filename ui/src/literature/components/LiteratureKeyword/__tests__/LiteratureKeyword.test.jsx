import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import LiteratureKeyword from '../LiteratureKeyword';

describe('LiteratureKeyword', () => {
  it('renders with keyword', () => {
    const keyword = fromJS({
      value: 'CMS',
    });
    const wrapper = shallow(<LiteratureKeyword keyword={keyword} />);
    expect(wrapper).toMatchSnapshot();
  });
});
