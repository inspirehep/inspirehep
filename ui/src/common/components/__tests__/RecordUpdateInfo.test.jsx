import React from 'react';
import { shallow } from 'enzyme';

import RecordUpdateInfo from '../RecordUpdateInfo';

describe('RecordUpdateInfo', () => {
  it('renders RecordUpdateInfo with correct update time', () => {
    const testDate = '2020-10-05T13:39:19.083762+00:00';
    const wrapper = shallow(<RecordUpdateInfo updateDate={testDate} />);
    expect(wrapper).toMatchSnapshot();
  });
});
