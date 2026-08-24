import { useEffect } from 'react';
import { Action, ActionCreator, AnyAction, Dispatch } from 'redux';
import { connect, ConnectedComponent } from 'react-redux';
import { Params, useParams } from 'react-router-dom';
import { RootState } from '../types';

import LoadingOrChildren from './components/LoadingOrChildren';
import { HttpClientWrapper } from './http';

// used to dispatch actions when route has changed
export default function withRouteActionsDispatcher<T>(
  DetailPage: ConnectedComponent<any, any>,
  {
    routeParamSelector,
    routeActions,
    loadingStateSelector,
  }: {
    routeParamSelector: (args: Params<string>) => T;
    routeActions: (
      selectedParam: T
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
    dispatch,
    loading,
    ...props
  }: {
    dispatch: ActionCreator<Action>;
    loading: boolean;
  }) => {
    const params = useParams();
    const selectedParam = routeParamSelector(params);

    useEffect(() => {
      routeActions(selectedParam).forEach(dispatch);
    }, [selectedParam, dispatch]);

    return (
      <LoadingOrChildren loading={loading}>
        <DetailPage {...props} />
      </LoadingOrChildren>
    );
  };

  return connect(
    (state: RootState) => ({ loading: loadingStateSelector(state) }),
    (dispatch) => ({ dispatch })
  )(Wrapper);
}
