import { render } from '@testing-library/react';

import { fromJS } from 'immutable';
import { getStore } from '../../../fixtures/store';
import JobTitle from '../JobTitle';
import { renderWithProviders } from '../../../fixtures/render';

describe('JobTitle', () => {
  it('renders with only position', () => {
    const { getByText } = render(<JobTitle position="VP of Happiness" />);
    expect(getByText('VP of Happiness')).toBeInTheDocument();
  });

  it('renders with position and external job id', () => {
    const store = getStore({
      user: fromJS({
        data: {
          roles: ['cataloger'],
        },
      }),
    });
    const { getByText } = renderWithProviders(
      <JobTitle position="VP of Happiness" externalJobId="R00123" />,
      { store }
    );
    expect(getByText('VP of Happiness')).toBeInTheDocument();
    expect(getByText('(R00123)')).toBeInTheDocument();
  });
});
