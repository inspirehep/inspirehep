import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';
import { getStore } from '../../../fixtures/store';
import JobTitle from '../JobTitle';

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
    const { getByText } = render(
      <Provider store={store}>
        <JobTitle position="VP of Happiness" externalJobId="R00123" />
      </Provider>
    );
    expect(getByText('VP of Happiness')).toBeInTheDocument();
    expect(getByText('(R00123)')).toBeInTheDocument();
  });
});
