import React from 'react';
import { shallow } from 'enzyme';

import { FulltextSnippet } from '../FulltextSnippet';

describe('FulltextSnippet', () => {
  it('renders', () => {
    const snippet = 'A snippet of <em>fulltext</em>';

    const wrapper = shallow(<FulltextSnippet snippet={snippet} />);
    expect(wrapper).toMatchSnapshot();
  });
});
