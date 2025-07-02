import React from 'react';
import { render, screen } from '@testing-library/react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import CurateReferenceDrawerContainer from '../CurateReferenceDrawerContainer';
import { CURATE_REFERENCE_NS } from '../../../search/constants';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

jest.mock(
  '../../components/CurateReferenceDrawer/CurateReferenceDrawer',
  () => {
    return function MockCurateReferenceDrawer(props: any) {
      return (
        <div data-testid="curate-reference-drawer">
          <div data-testid="reference-id">{props.referenceId}</div>
          <div data-testid="visible">{props.visible ? 'true' : 'false'}</div>
          <div data-testid="loading">{props.loading ? 'true' : 'false'}</div>
        </div>
      );
    };
  }
);

describe('CurateReferenceDrawerContainer', () => {
  it('passes state to props', () => {
    const namespace = CURATE_REFERENCE_NS;

    const store = getStore({
      literature: fromJS({
        referenceDrawer: 123456,
      }),
      search: fromJS({
        namespaces: {
          [namespace]: {
            loading: false,
          },
        },
      }),
    });

    render(
      <Provider store={store}>
        <CurateReferenceDrawerContainer
          namespace={CURATE_REFERENCE_NS}
          recordId={1234}
          recordUuid="1234"
          revisionId={1}
        />
      </Provider>
    );

    expect(screen.getByTestId('reference-id')).toHaveTextContent('123456');
    expect(screen.getByTestId('visible')).toHaveTextContent('true');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });
});
