import { connect, RootStateOrAny } from 'react-redux';

import NumberOfResults from '../components/NumberOfResults';

const stateToProps = (state: RootStateOrAny, { namespace }: { namespace: string }) => ({
  numberOfResults: state.search.getIn(['namespaces', namespace, 'total']),
});

export default connect(stateToProps)(NumberOfResults);
