import React from 'react';
import { screen } from '@testing-library/react';
import { fromJS } from 'immutable';

import { getStore } from '../../../fixtures/store';
import CurateReferenceDrawerContainer from '../CurateReferenceDrawerContainer';
import { CURATE_REFERENCE_NS } from '../../../search/constants';
import { renderWithProviders } from '../../../fixtures/render';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useParams: jest.fn().mockImplementation(() => ({
      id: 123,
    })),
  };
});

jest.mock(
  '../../components/CurateReferenceDrawer/CurateReferenceDrawer',
  () => (props: any) => (
    <div data-testid="curate-reference-drawer">
      <div data-testid="reference-id">{props.referenceId}</div>
      <div data-testid="visible">{props.visible ? 'true' : 'false'}</div>
      <div data-testid="loading">{props.loading ? 'true' : 'false'}</div>
    </div>
  )
);

describe('CurateReferenceDrawerContainer', () => {
  it('passes state to props', async () => {
    const namespace = CURATE_REFERENCE_NS;
    const initialState = {
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
      router: {
        location: { pathname: '/literature/123/curate' },
      },
    };

    const store = getStore(initialState);
    const { findByTestId } = renderWithProviders(
      <CurateReferenceDrawerContainer
        namespace={CURATE_REFERENCE_NS}
        recordId={1234}
        recordUuid="1234"
        revisionId={1}
      />,
      {
        store,
        route: '/literature/123/curate',
      }
    );

    const referenceId = await findByTestId('reference-id');
    const visible = await findByTestId('visible');
    const loading = await findByTestId('loading');

    expect(referenceId).toHaveTextContent('123456');
    expect(visible).toHaveTextContent('true');
    expect(loading).toHaveTextContent('false');
  });
});
