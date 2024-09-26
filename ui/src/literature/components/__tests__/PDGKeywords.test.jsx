import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { PDGKeywords } from '../PDGKeywords';

describe('PDGKeywords', () => {
  it('renders with keywords', () => {
    const keywords = fromJS([
      {
        value: 'Q007TP',
        description:
          // eslint-disable-next-line no-template-curly-in-string
          '\\Gamma($  ${{\\mathit W}^{+}}$   $\\rightarrow$   ${{\\mathit \\ell}^{+}}{{\\mathit \\nu}})/\\Gamma_{\\text{total}}',
      },
      {
        value: '2137',
        description: 'test',
      },
    ]);
    const wrapper = shallow(<PDGKeywords keywords={keywords} />);
    expect(wrapper).toMatchSnapshot();
  });
});
