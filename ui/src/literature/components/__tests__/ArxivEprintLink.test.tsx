import React from 'react';
import { shallow } from 'enzyme';

import ArxivEprintLink from '../ArxivEprintLink';

<<<<<<< Updated upstream

describe('ArxivEprintLink', () => {
  
=======
describe('ArxivEprintLink', () => {
>>>>>>> Stashed changes
  it('renders with arXiv id', () => {
    const wrapper = shallow((
      <ArxivEprintLink>
        123.123456
      </ArxivEprintLink>
    ));
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper).toMatchSnapshot();
  });
});
