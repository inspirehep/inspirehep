import { connect } from 'react-redux';

import { setPulicationSelection } from '../../actions/authors';
import PublicationsSelectAll from '../components/PublicationsSelectAll';
import { AUTHOR_PUBLICATIONS_NS } from '../../search/constants';

const stateToProps = state => ({
  publications: state.search.getIn([
    'namespaces',
    AUTHOR_PUBLICATIONS_NS,
    'results',
  ]),
  selection: state.authors.get('publicationSelection'),
});

const dispatchToProps = dispatch => ({
  onChange(publicationIds, selected) {
    dispatch(setPulicationSelection(publicationIds, selected));
  },
});

export default connect(stateToProps, dispatchToProps)(PublicationsSelectAll);
