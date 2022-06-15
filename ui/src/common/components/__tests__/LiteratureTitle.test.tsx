import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import LiteratureTitle from '../LiteratureTitle';


describe('LiteratureTitle', () => {
  
  it('renders with only title', () => {
    const title = fromJS({
      title: 'Test Literature Title',
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<LiteratureTitle title={title} />);
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders with title and subtitle', () => {
    const title = fromJS({
      title: 'Test Literature Title',
      subtitle: 'Test Literature Sub Title',
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<LiteratureTitle title={title} />);
    
    expect(wrapper).toMatchSnapshot();
  });
});
