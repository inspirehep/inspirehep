import React from 'react';
import { shallow } from 'enzyme';

import NumberOfPages from '../NumberOfPages';

<<<<<<< Updated upstream

describe('NumberOfPages', () => {
  
=======
describe('NumberOfPages', () => {
>>>>>>> Stashed changes
  it('renders with number of pages', () => {
    const numberOfPages = 100;
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<NumberOfPages numberOfPages={numberOfPages} />);
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders empty if null', () => {
    const wrapper = shallow(<NumberOfPages />);
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

  it('renders empty if null', () => {
    const wrapper = shallow(<NumberOfPages />);
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('display `page` if number_of_pages is 1', () => {
    const numberOfPages = 1;
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<NumberOfPages numberOfPages={numberOfPages} />);
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper).toMatchSnapshot();
  });
});
