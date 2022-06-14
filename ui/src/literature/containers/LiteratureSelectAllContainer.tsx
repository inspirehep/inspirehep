// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import { setLiteratureSelection } from '../../actions/literature';
import LiteratureSelectAll from '../components/LiteratureSelectAll';
import { LITERATURE_NS } from '../../search/constants';

const stateToProps = (state: $TSFixMe) => ({
  publications: state.search.getIn(['namespaces', LITERATURE_NS, 'results']),
  selection: state.literature.get('literatureSelection')
});

const dispatchToProps = (dispatch: $TSFixMe) => ({
  onChange(literatureIds: $TSFixMe, selected: $TSFixMe) {
    dispatch(setLiteratureSelection(literatureIds, selected));
  }
});

export default connect(stateToProps, dispatchToProps)(LiteratureSelectAll);
