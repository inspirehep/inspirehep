import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import ReportNumberList from '../ReportNumberList';

describe('ReportNumberList', () => {
  it('renders with report numbers', () => {
    const reportNumbers = fromJS([
      {
        value: 'ABCD-AB-CD-1234-123',
      },
    ]);
    const { asFragment } = render(
      <ReportNumberList reportNumbers={reportNumbers} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
