import React from 'react';
import { shallow } from 'enzyme';
import DisabledEditRecordAction from '../DisabledEditRecordAction';

describe('DisabledEditRecordAction', () => {
  it('renders with message', () => {
    const wrapper = shallow(
      <DisabledEditRecordAction message="Can not be edited" />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
