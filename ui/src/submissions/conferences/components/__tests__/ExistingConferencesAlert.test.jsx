import React from 'react';
import { shallow } from 'enzyme';

import ExistingConferencesAlert from '../ExistingConferencesAlert';

describe('ExistingConferencesAlert', () => {
  it('renders alert and drawer', () => {
    const dates = ['2020-01-24', '2020-09-20'];
    const onDatesChange = jest.fn();
    const numberOfConferences = 5;

    const wrapper = shallow(
      <ExistingConferencesAlert
        dates={dates}
        onDatesChange={onDatesChange}
        numberOfConferences={numberOfConferences}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
