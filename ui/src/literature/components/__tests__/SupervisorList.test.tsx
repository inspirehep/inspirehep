import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import SupervisorList from '../SupervisorList';

<<<<<<< Updated upstream

describe('SupervisorList', () => {
  
=======
describe('SupervisorList', () => {
>>>>>>> Stashed changes
  it('renders with multiple supervisors', () => {
    const supervisors = fromJS([
      {
        uuid: '123',
        full_name: 'John Doe',
      },
      {
        uuid: '456',
        full_name: 'Jane Doe',
      },
    ]);
    const wrapper = shallow(<SupervisorList supervisors={supervisors} />);
<<<<<<< Updated upstream
    
    expect(wrapper.dive()).toMatchSnapshot();
  });

  
=======
    expect(wrapper.dive()).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('renders with one supervisor', () => {
    const supervisors = fromJS([
      {
        uuid: '123',
        full_name: 'John Doe',
      },
    ]);
    const wrapper = shallow(<SupervisorList supervisors={supervisors} />);
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
