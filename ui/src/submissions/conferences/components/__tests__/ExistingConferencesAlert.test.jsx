import React from 'react';
import { render } from '@testing-library/react';

import ExistingConferencesAlert from '../ExistingConferencesAlert';

describe('ExistingConferencesAlert', () => {
  it('renders alert and drawer', () => {
    const dates = ['2020-01-24', '2020-09-20'];
    const onDatesChange = jest.fn();
    const numberOfConferences = 5;

    const { asFragment, getByTestId } = render(
      <ExistingConferencesAlert
        dates={dates}
        onDatesChange={onDatesChange}
        numberOfConferences={numberOfConferences}
      />
    );
    expect(asFragment()).toMatchSnapshot();
    expect(getByTestId('conferences-exist-alert-number')).toHaveTextContent(
      '5'
    );
  });
});
