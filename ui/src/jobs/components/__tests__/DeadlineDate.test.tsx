import React from 'react';
import { shallow } from 'enzyme';
import DeadlineDate from '../DeadlineDate';


describe('DeadlineDate', () => {
  
  it('renders with deadlineDate', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <DeadlineDate deadlineDate="2003-03-12T00:00:00+00:00" />
    );
    
    expect(wrapper).toMatchSnapshot();
  });
});
