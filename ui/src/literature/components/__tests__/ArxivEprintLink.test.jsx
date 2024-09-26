import React from 'react';
import { shallow } from 'enzyme';

import ArxivEprintLink from '../ArxivEprintLink';

describe('ArxivEprintLink', () => {
  it('renders with arXiv id', () => {
    const wrapper = shallow((
      <ArxivEprintLink>
        123.123456
      </ArxivEprintLink>
    ));
    expect(wrapper).toMatchSnapshot();
  });
});
