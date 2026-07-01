import React, { useEffect } from 'react';
import { Action, ActionCreator, AnyAction, Dispatch } from 'redux';
import { connect, ConnectedComponent } from 'react-redux';
import { withRouter, match } from 'react-router-dom';
import { RootState } from '../types';

import { getWrapperComponentDisplayName } from './utils';
import LoadingOrChildren from './components/LoadingOrChildren';
import { HttpClientWrapper } from './http';

// used to dispatch actions when route has changed
export default function withRouteActionsDispatcher(
  DetailPage: ConnectedComponent<any, any>,
  {
    routeParamSelector,
    routeActions,
    loadingStateSelector,
  }: {
    routeParamSelector: ({ id }: { id: string }) => string;
    routeActions: (
      id?: string
    ) => (
      | ((
          dispatch: Dispatch<AnyAction>,
          getState: () => RootState,
          http: HttpClientWrapper
        ) => Promise<void>)
      | { type: string; payload: unknown }
    )[];
    loadingStateSelector: (state: RootState) => boolean;
  }
) {
  const Wrapper = ({
    match,
    dispatch,
    loading,
    ...props
  }: {
    match: match<{ id: string; old?: string; new?: string }>;
    dispatch: ActionCreator<Action>;
    loading: boolean;
  }) => {
    const selectedParam = routeParamSelector(match.params);
    useEffect(() => {
      routeActions(selectedParam).forEach(dispatch);
    }, [selectedParam, dispatch]);

    return (
      <LoadingOrChildren loading={loading}>
        <DetailPage {...props} />
      </LoadingOrChildren>
    );
  };

  const ConnectedWrapper = connect(
    (state: RootState) => ({ loading: loadingStateSelector(state) }),
    (dispatch) => ({ dispatch })
  )(Wrapper);

  const ConnectedWrapperWithRouter = withRouter(ConnectedWrapper);

  ConnectedWrapperWithRouter.displayName = getWrapperComponentDisplayName(
    'withRouteActionsDispatcher',
    DetailPage
  );
  return ConnectedWrapperWithRouter;
}
