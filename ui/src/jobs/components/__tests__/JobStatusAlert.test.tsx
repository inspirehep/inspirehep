import React from 'react';
import { shallow } from 'enzyme';
import JobStatusAlert from '../JobStatusAlert';


describe('JobStatusAlert', () => {
  
  it('does not render with status open', () => {
    // @ts-expect-error ts-migrate(2786) FIXME: 'JobStatusAlert' cannot be used as a JSX component... Remove this comment to see the full error message
    const wrapper = shallow(<JobStatusAlert status="open" />);
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders alert with status pending and correct type and message', () => {
    // @ts-expect-error ts-migrate(2786) FIXME: 'JobStatusAlert' cannot be used as a JSX component... Remove this comment to see the full error message
    const wrapper = shallow(<JobStatusAlert status="pending" />);
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders alert with status closed and correct type and message', () => {
    // @ts-expect-error ts-migrate(2786) FIXME: 'JobStatusAlert' cannot be used as a JSX component... Remove this comment to see the full error message
    const wrapper = shallow(<JobStatusAlert status="closed" />);
    
    expect(wrapper).toMatchSnapshot();
  });
});
