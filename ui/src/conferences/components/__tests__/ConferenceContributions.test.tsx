import React from 'react';
import { shallow } from 'enzyme';

import ConferenceContributions from '../ConferenceContributions';

describe('ConferenceContributions', () => {
  it('renders', () => {
    const wrapper = shallow(
      <ConferenceContributions conferenceRecordId="12345" />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
