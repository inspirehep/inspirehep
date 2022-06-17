import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import IsbnList from '../IsbnList';

<<<<<<< Updated upstream

describe('IsbnList', () => {
  
=======
describe('IsbnList', () => {
>>>>>>> Stashed changes
  it('renders isbns with medium and without medium', () => {
    const isbns = fromJS([
      {
        value: '9781139632478',
        medium: 'print',
      },
      {
        value: '1231139632475',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<IsbnList isbns={isbns} />);
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
