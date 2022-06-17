import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ParentRecordInfo from '../ParentRecordInfo';

<<<<<<< Updated upstream

describe('ParentRecordInfo', () => {
  
=======
describe('ParentRecordInfo', () => {
>>>>>>> Stashed changes
  it('renders with parent record', () => {
    const parentRecord = fromJS({
      title: 'A title of book',
      record: { $ref: 'http://localhost:5000/api/literature/1234' },
    });
    {/* @ts-ignore */}
    const wrapper = shallow(<ParentRecordInfo parentRecord={parentRecord} />);
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
=======
    expect(wrapper).toMatchSnapshot();
  });

>>>>>>> Stashed changes
  it('renders with parent record', () => {
    const parentRecord = fromJS({
      title: 'A title of book',
      subtitle: 'A subtitle',
      record: { $ref: 'http://localhost:5000/api/literature/1234' },
    });
    {/* @ts-ignore */}
    const wrapper = shallow(<ParentRecordInfo parentRecord={parentRecord} />);
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper).toMatchSnapshot();
  });
});
