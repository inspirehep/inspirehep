import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import NumberOfResultsContainer from '../NumberOfResultsContainer';
import { AUTHOR_PUBLICATIONS_NS } from '../../../search/constants';

describe('NumberOfResultsContainer', () => {
  it('passes search namepspace total state', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStore({
      search: fromJS({
        namespaces: {
          [namespace]: {
            total: 5,
          },
        },
      }),
    });
    const { getByText } = render(
      <Provider store={store}>
        <NumberOfResultsContainer namespace={namespace} />
      </Provider>
    );
    expect(getByText('5 results')).toBeInTheDocument();
  });
});
