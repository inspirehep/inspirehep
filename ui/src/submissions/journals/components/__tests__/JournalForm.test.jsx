import React from 'react';
import { shallow } from 'enzyme';

import { JournalForm } from '../JournalForm';

describe('JournalForm', () => {
  it('renders', () => {
    const wrapper = shallow(<JournalForm />);
    expect(wrapper).toMatchSnapshot();
  });
});
