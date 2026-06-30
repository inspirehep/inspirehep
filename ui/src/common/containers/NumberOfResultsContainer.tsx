import { connect } from 'react-redux';
import { RootState } from '../../types';

import NumberOfResults from '../components/NumberOfResults';

const stateToProps = (
  state: RootState,
  { namespace }: { namespace: string }
) => ({
  numberOfResults: state.search.getIn(['namespaces', namespace, 'total']),
});

export default connect(stateToProps)(NumberOfResults);
