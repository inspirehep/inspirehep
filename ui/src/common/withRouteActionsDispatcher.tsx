import React, { useEffect } from 'react';
import { Action, ActionCreator, AnyAction, Dispatch } from 'redux';
import { connect, ConnectedComponent, RootStateOrAny } from 'react-redux';
import { withRouter } from 'react-router-dom';

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
    routeParamSelector: ({ id }: { id: number }) => number;
    routeActions: (
      id: number
    ) => (
      | ((
          dispatch: Dispatch<AnyAction>,
          getState: () => RootStateOrAny,
          http: HttpClientWrapper
        ) => Promise<void>)
      | { type: string; payload: unknown }
    )[];
    loadingStateSelector: (state: RootStateOrAny) => boolean;
  }
) {
  const Wrapper = ({
    match,
    dispatch,
    loading,
    ...props
  }: {
    match: { params: { id: number; old?: number; new?: number } };
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
    (state) => ({ loading: loadingStateSelector(state) }),
    (dispatch) => ({ dispatch })
  )(Wrapper);

  const ConnectedWrapperWithRouter = withRouter(ConnectedWrapper);

  ConnectedWrapperWithRouter.displayName = getWrapperComponentDisplayName(
    'withRouteActionsDispatcher',
    DetailPage
  );
  return ConnectedWrapperWithRouter;
}
