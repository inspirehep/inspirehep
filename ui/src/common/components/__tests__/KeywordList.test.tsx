import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import KeywordList from '../KeywordList';

describe('KeywordList', () => {
  it('renders with keywords', () => {
    const keywords = fromJS([
      {
        value: 'CMS',
      },
      {
        value: 'LHC-B',
      },
    ]);
    const wrapper = shallow(<KeywordList keywords={keywords} />);
    // FIXME: we need to .dive().dive() to be able test list items
    expect(wrapper).toMatchSnapshot();
  });
});
