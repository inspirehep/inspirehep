// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import CiteAllAction from '../components/CiteAllAction';
import { convertAllImmutablePropsToJS } from '../../common/immutableToJS';

const stateToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'state' implicitly has an 'any' type.
  state,
  {
    namespace
  }: $TSFixMe
) => ({
  numberOfResults: state.search.getIn(['namespaces', namespace, 'total']),
  query: state.search.getIn(['namespaces', namespace, 'query'])
});

export default connect(stateToProps)(
  convertAllImmutablePropsToJS(CiteAllAction)
);
