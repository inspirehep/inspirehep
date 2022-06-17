import React from 'react';
import { shallow } from 'enzyme';
import { fromJS, Set, List } from 'immutable';
import { Checkbox } from 'antd';

import LiteratureSelectAll from '../LiteratureSelectAll';

<<<<<<< Updated upstream

describe('LiteratureSelectAll', () => {
  
=======
describe('LiteratureSelectAll', () => {
>>>>>>> Stashed changes
  it('renders checked if all publications are part of the selection', () => {
    const publications = fromJS([
      {
        metadata: {
          control_number: 1,
        },
      },
      {
        metadata: {
          control_number: 2,
        },
      },
    ]);
    const selection = Set([1, 2]);
    const wrapper = shallow(
      <LiteratureSelectAll
        publications={publications}
        selection={selection}
<<<<<<< Updated upstream
        
        onChange={jest.fn()}
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
        onChange={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('render unchecked if all publications are not part of the selection', () => {
    const publications = fromJS([
      {
        metadata: {
          control_number: 1,
        },
      },
      {
        metadata: {
          control_number: 2,
        },
      },
    ]);
    const selection = Set([2]);
    const wrapper = shallow(
      <LiteratureSelectAll
        publications={publications}
        selection={selection}
<<<<<<< Updated upstream
        
        onChange={jest.fn()}
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
        onChange={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('calls onChange with publication ids when checkbox change', () => {
    const publications = fromJS([
      {
        metadata: {
          control_number: 1,
        },
      },
      {
        metadata: {
          control_number: 2,
        },
      },
    ]);
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    const onChange = jest.fn();
    const selection = Set([2]);
    const wrapper = shallow(
      <LiteratureSelectAll
        publications={publications}
        selection={selection}
        onChange={onChange}
      />
    );
    const onCheckboxChange = wrapper.find(Checkbox).prop('onChange');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onCheckboxChange({ target: { checked: true } });
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(onChange).toHaveBeenCalledWith(List([1, 2]), true);
  });
});
