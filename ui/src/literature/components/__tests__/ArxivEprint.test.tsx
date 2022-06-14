import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ArxivEprint from '../ArxivEprint';

describe('ArxivEprint', () => {
  it('renders with arXiv id', () => {
    const eprint = fromJS({
      value: '123.12345',
      categories: ['cat'],
    });
    const wrapper = shallow((
      <ArxivEprint
        eprint={eprint}
      />
    ));
    expect(wrapper).toMatchSnapshot();
  });
});
