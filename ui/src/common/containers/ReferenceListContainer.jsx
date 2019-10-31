import { connect } from 'react-redux';

import { fetchLiteratureReferences } from '../../actions/literature';
import ReferenceList from '../../literature/components/ReferenceList';
import { convertSomeImmutablePropsToJS } from '../immutableToJS';

const stateToProps = state => ({
  loading: state.literature.get('loadingReferences'),
  references: state.literature.get('references'),
  error: state.literature.get('errorReferences'),
  total: state.literature.get('totalReferences'),
  query: state.literature.get('queryReferences'),
});

const dispatchToProps = (dispatch, ownProps) => ({
  onQueryChange(query) {
    const { recordId } = ownProps;
    dispatch(fetchLiteratureReferences(recordId, query));
  },
});

export default connect(stateToProps, dispatchToProps)(
  convertSomeImmutablePropsToJS(ReferenceList, ['query'])
);
