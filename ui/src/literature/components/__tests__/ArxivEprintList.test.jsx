import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ArxivEprintList from '../ArxivEprintList';

describe('ArxivEprintList', () => {
  it('renders with arXiv id', () => {
    const eprints = fromJS([
      {
        value: '123.12345',
      },
    ]);
    const wrapper = shallow((
      <ArxivEprintList eprints={eprints} />
    ));
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
