import { connect } from 'react-redux';

import {
  fetchAuthorPulications,
  fetchAuthorPulicationsFacets,
} from '../../actions/authors';
import EmbeddedSearch from '../../common/components/EmbeddedSearch';
import { convertSomeImmutablePropsToJS } from '../../common/immutableToJS';

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
    dispatch(fetchAuthorPulications(queryChange));
    dispatch(fetchAuthorPulicationsFacets(queryChange));
  },
});

export default connect(stateToProps, dispatchToProps)(
  convertSomeImmutablePropsToJS(EmbeddedSearch, ['query'])
);
