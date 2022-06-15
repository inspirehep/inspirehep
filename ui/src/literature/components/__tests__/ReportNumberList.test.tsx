import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ReportNumberList from '../ReportNumberList';

<<<<<<< Updated upstream

describe('ReportNumberList', () => {
  
=======
describe('ReportNumberList', () => {
>>>>>>> Stashed changes
  it('renders with report numbers', () => {
    const reportNumbers = fromJS([
      {
        value: 'ABCD-AB-CD-1234-123',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ReportNumberList reportNumbers={reportNumbers} />);
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
