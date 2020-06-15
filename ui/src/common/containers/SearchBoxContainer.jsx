import { connect } from 'react-redux';

import SearchBox from '../components/SearchBox';
import { searchQueryUpdate } from '../../actions/search';
import { LITERATURE_NS } from '../../search/constants';
import { appendQueryToLocationSearch } from '../../actions/router';
import { UI_CITATION_SUMMARY_PARAM } from '../../literature/containers/CitationSummarySwitchContainer';
import { UI_EXCLUDE_SELF_CITATIONS_PARAM } from '../../literature/containers/ExcludeSelfCitationsContainer';

const stateToProps = state => ({
  value: state.search.getIn([
    'namespaces',
    state.search.get('searchBoxNamespace'),
    'query',
    'q',
  ]),
  namespace: state.search.get('searchBoxNamespace'),
});

export const dispatchToProps = dispatch => ({
  onSearch(namespace, value) {
    if (namespace !== LITERATURE_NS) {
      dispatch(
        appendQueryToLocationSearch({
          [UI_CITATION_SUMMARY_PARAM]: undefined,
          [UI_EXCLUDE_SELF_CITATIONS_PARAM]: undefined,
        })
      );
    }

    dispatch(searchQueryUpdate(namespace, { q: value }));
  },
});

export default connect(stateToProps, dispatchToProps)(SearchBox);
