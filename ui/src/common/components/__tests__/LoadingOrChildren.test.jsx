import React from 'react';

import { render } from '@testing-library/react';
import LoadingOrChildren from '../LoadingOrChildren';

describe('LoadingOrChildren', () => {
  it('render with loading', () => {
    const { getByText } = render(<LoadingOrChildren loading />);
    expect(getByText('Loading ...')).toBeInTheDocument();
  });

  it('render without loading', () => {
    const { getByText, queryByText } = render(
      <LoadingOrChildren loading={false}>
        <div>
          <h2>Test</h2>
        </div>
      </LoadingOrChildren>
    );
    expect(getByText('Test')).toBeInTheDocument();
    expect(queryByText('Loading ...')).toBeNull();
  });
});
