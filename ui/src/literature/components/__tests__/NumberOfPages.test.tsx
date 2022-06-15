import React from 'react';
import { shallow } from 'enzyme';

import NumberOfPages from '../NumberOfPages';


describe('NumberOfPages', () => {
  
  it('renders with number of pages', () => {
    const numberOfPages = 100;
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<NumberOfPages numberOfPages={numberOfPages} />);
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders empty if null', () => {
    const wrapper = shallow(<NumberOfPages />);
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('display `page` if number_of_pages is 1', () => {
    const numberOfPages = 1;
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<NumberOfPages numberOfPages={numberOfPages} />);
    
    expect(wrapper).toMatchSnapshot();
  });
});
