import { fromJS } from 'immutable';

import { getStore } from '../../../fixtures/store';
import NumberOfResultsContainer from '../NumberOfResultsContainer';
import { AUTHOR_PUBLICATIONS_NS } from '../../../search/constants';
import { renderWithProviders } from '../../../fixtures/render';

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
    const { getByText } = renderWithProviders(
      <NumberOfResultsContainer namespace={namespace} />,
      { store }
    );
    expect(getByText('5 results')).toBeInTheDocument();
  });
});
