import { fromJS, List } from 'immutable';

import { renderWithProviders } from '../../../fixtures/render';
import { getStore } from '../../../fixtures/store';
import ResultsContainer from '../ResultsContainer';
import { JOBS_NS } from '../../../search/constants';

describe('ResultsContainer', () => {
  it('passes results from state', () => {
    const namespace = JOBS_NS;
    const results = fromJS([
      {
        id: 1,
        value: 'value1',
      },
      {
        id: 2,
        value: 'value2',
      },
    ]);
    const store = getStore({
      search: fromJS({
        namespaces: {
          [namespace]: {
            results,
            query: { page: 1, size: 25 },
          },
        },
        user: { roles: List() },
      }),
    });
    const renderItem = (result) => <span>{result.get('value')}</span>;

    const { getByText } = renderWithProviders(
      <ResultsContainer namespace={namespace} renderItem={renderItem} />,
      {
        store,
      }
    );
    expect(getByText('value1')).toBeInTheDocument();
    expect(getByText('value2')).toBeInTheDocument();
  });
});
