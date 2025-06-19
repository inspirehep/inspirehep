import React from 'react';
import { render } from '@testing-library/react';

import DisabledEditRecordAction from '../DisabledEditRecordAction';

describe('DisabledEditRecordAction', () => {
  it('renders with message', () => {
    const { asFragment } = render(
      <DisabledEditRecordAction message="Can not be edited" />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
