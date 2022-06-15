import { connect } from 'react-redux';

import { setLiteratureSelection } from '../../actions/literature';
import LiteratureSelectAll from '../components/LiteratureSelectAll';
import { LITERATURE_NS } from '../../search/constants';

const stateToProps = (state: any) => ({
  publications: state.search.getIn(['namespaces', LITERATURE_NS, 'results']),
  selection: state.literature.get('literatureSelection')
});

const dispatchToProps = (dispatch: any) => ({
  onChange(literatureIds: any, selected: any) {
    dispatch(setLiteratureSelection(literatureIds, selected));
  }
});

export default connect(stateToProps, dispatchToProps)(LiteratureSelectAll);
