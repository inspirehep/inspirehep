import React from 'react';
import { fromJS } from 'immutable';

import { getStore } from '../../../fixtures/store';
import CiteAllActionContainer from '../CiteAllActionContainer';
import { LITERATURE_NS } from '../../../search/constants';
import { renderWithProviders } from '../../../fixtures/render';

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
    const store = getStore({
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: { sort: 'mostcited', q: 'query' },
            total: 11,
          },
        },
      }),
    });
    const { getByTestId } = renderWithProviders(
      <CiteAllActionContainer namespace={namespace} />,
      { store }
    );

    const component = getByTestId('cite-all-action');
    const props = JSON.parse(component.getAttribute('data-props'));

    expect(props.query).toEqual({ sort: 'mostcited', q: 'query' });
    expect(props.numberOfResults).toBe(11);
  });
});
