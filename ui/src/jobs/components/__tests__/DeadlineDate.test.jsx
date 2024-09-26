import React from 'react';
import { shallow } from 'enzyme';
import DeadlineDate from '../DeadlineDate';

describe('DeadlineDate', () => {
  it('renders with deadlineDate', () => {
    const wrapper = shallow(
      <DeadlineDate deadlineDate="2003-03-12T00:00:00+00:00" />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
