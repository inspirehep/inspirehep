import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import FullTextLinksAction from '../FullTextLinksAction';

describe('FullTextLinksAction', () => {
  it('renders multiple, with and without description', () => {
    const fullTextLinks = fromJS([
      {
        description: 'Whatever',
        value: 'https://www.whatever.com/pdfs/fulltext.pdf',
      },
      { value: 'www.descriptionless.com/fulltext.pdf' },
    ]);
    const wrapper = shallow(
      <FullTextLinksAction fullTextLinks={fullTextLinks} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders single', () => {
    const fullTextLinks = fromJS([
      {
        description: 'Whatever',
        value: 'https://www.whatever.com/pdfs/fulltext.pdf',
      },
    ]);
    const wrapper = shallow(
      <FullTextLinksAction fullTextLinks={fullTextLinks} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
