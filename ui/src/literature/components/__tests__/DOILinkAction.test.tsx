import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import DOILinkAction from '../DOILinkAction';

<<<<<<< Updated upstream

describe('DOILinkAction', () => {
  
  it('renders with a doi id', () => {
    const dois = fromJS([{ value: '10.1007/s11182-019-01606-1' }]);
    const wrapper = shallow(<DOILinkAction dois={dois} />);
    
    expect(wrapper.dive()).toMatchSnapshot();
  });

  
=======
describe('DOILinkAction', () => {
  it('renders with a doi id', () => {
    const dois = fromJS([{ value: '10.1007/s11182-019-01606-1' }]);
    const wrapper = shallow(<DOILinkAction dois={dois} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('renders with multiple doi ids', () => {
    const dois = fromJS([
      { value: '10.1007/s11182-019-01606-1' },
      { value: '10.1007/s11182-019-01606-2' },
    ]);
    const wrapper = shallow(<DOILinkAction dois={dois} />);
<<<<<<< Updated upstream
    
    expect(wrapper.dive()).toMatchSnapshot();
  });

  
=======
    expect(wrapper.dive()).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('renders with multiple doi ids and material', () => {
    const dois = fromJS([
      { value: '10.1007/s11182-019-01606-1' },
      { value: '10.1007/s11182-019-01606-2', material: 'publication' },
    ]);
    const wrapper = shallow(<DOILinkAction dois={dois} />);
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
