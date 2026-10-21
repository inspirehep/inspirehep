import { Map } from 'immutable';

import { getFromObjectOrImmutableMap } from '../utils';
import ErrorAlert from './ErrorAlert';

const ErrorAlertOrChildren = ({
  error,
  children,
}: {
  error: Map<string, string> | undefined;
  children: React.JSX.Element;
}) => {
  if (error) {
    return (
      <ErrorAlert message={getFromObjectOrImmutableMap(error, 'message')} />
    );
  }
  return children;
};

export default ErrorAlertOrChildren;
