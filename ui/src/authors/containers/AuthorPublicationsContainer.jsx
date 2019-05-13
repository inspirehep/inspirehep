import { connect } from 'react-redux';

import {
  fetchAuthorPublications,
  fetchAuthorPublicationsFacets,
} from '../../actions/authors';
import EmbeddedSearch from '../../common/components/EmbeddedSearch';
import { convertSomeImmutablePropsToJS } from '../../common/immutableToJS';
import { fetchCitationSummary } from '../../actions/citations';

const stateToProps = state => ({
  aggregations: state.authors.getIn(['publications', 'aggregations']),
  loadingAggregations: state.authors.getIn([
    'publications',
    'loadingAggregations',
  ]),
  query: state.authors.getIn(['publications', 'query']),
  results: state.authors.getIn(['publications', 'results']),
  loadingResults: state.authors.getIn(['publications', 'loadingResults']),
  numberOfResults: state.authors.getIn(['publications', 'total']),
  error: state.authors.getIn(['publications', 'error']),
});

export const dispatchToProps = dispatch => ({
  onQueryChange(queryChange) {
    dispatch(fetchAuthorPublications(queryChange));
    dispatch(fetchAuthorPublicationsFacets(queryChange));
    dispatch(fetchCitationSummary());
  },
});

export default connect(stateToProps, dispatchToProps)(
  convertSomeImmutablePropsToJS(EmbeddedSearch, ['query'])
);
