import { connect } from 'react-redux';

import NumberOfResults from '../components/NumberOfResults';

const stateToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'state' implicitly has an 'any' type.
  state,
  {
    namespace
  }: any
) => ({
  numberOfResults: state.search.getIn(['namespaces', namespace, 'total'])
});

export default connect(stateToProps)(NumberOfResults);
