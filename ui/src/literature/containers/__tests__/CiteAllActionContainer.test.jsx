import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import CiteAllActionContainer from '../CiteAllActionContainer';
import { LITERATURE_NS } from '../../../search/constants';

jest.mock('../../components/CiteAllAction', () => (props) => (
  <div
    data-testid="cite-all-action"
    data-props={JSON.stringify({
      query: props.query,
      numberOfResults: props.numberOfResults,
    })}
  >
    CiteAllAction Mock
  </div>
));

describe('CiteAllActionContainer', () => {
  it('passes literature namespace query and number of results', () => {
    const namespace = LITERATURE_NS;
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: { sort: 'mostcited', q: 'query' },
            total: 11,
          },
        },
      }),
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <CiteAllActionContainer namespace={namespace} />
      </Provider>
    );

    const component = getByTestId('cite-all-action');
    const props = JSON.parse(component.getAttribute('data-props'));

    expect(props.query).toEqual({ sort: 'mostcited', q: 'query' });
    expect(props.numberOfResults).toBe(11);
  });
});
