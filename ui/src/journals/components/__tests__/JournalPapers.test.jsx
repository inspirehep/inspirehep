import React from 'react';
import { shallow } from 'enzyme';

import JournalPapers from '../JournalPapers';

describe('JournalPapers', () => {
  it('renders', () => {
    const wrapper = shallow(
      <JournalPapers journalName="JHEP" />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
