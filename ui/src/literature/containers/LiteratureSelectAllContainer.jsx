import { connect } from 'react-redux';

import { setLiteratureSelection } from '../../actions/literature';
import LiteratureSelectAll from '../components/LiteratureSelectAll';
import { LITERATURE_NS } from '../../search/constants';

const stateToProps = (state) => ({
  publications: state.search.getIn(['namespaces', LITERATURE_NS, 'results']),
  selection: state.literature.get('literatureSelection'),
});

const dispatchToProps = (dispatch) => ({
  onChange(literatureIds, selected) {
    dispatch(setLiteratureSelection(literatureIds, selected));
  },
});

export default connect(stateToProps, dispatchToProps)(LiteratureSelectAll);
