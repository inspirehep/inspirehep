import { connect } from 'react-redux';

import EmbeddedLiteratureSearch from '../components/EmbeddedLiteratureSearch';
import { convertSomeImmutablePropsToJS } from '../immutableToJS';
import { search, setOptions } from '../../actions/embeddedSearch';

const stateToProps = state => ({
  aggregations: state.embeddedSearch.get('aggregations'),
  initialAggregations: state.embeddedSearch.get('initialAggregations'),
  loadingAggregations: state.embeddedSearch.get('loadingAggregations'),
  query: state.embeddedSearch.get('query'),
  results: state.embeddedSearch.get('results'),
  sortOptions: state.embeddedSearch.get('sortOptions'),
  loadingResults: state.embeddedSearch.get('loadingResults'),
  numberOfResults: state.embeddedSearch.get('total'),
  error: state.embeddedSearch.get('error'),
});

export const dispatchToProps = (dispatch, ownProps) => ({
  onQueryChange(queryChange) {
    dispatch(search(queryChange));
  },
  onOptionsChange(options) {
    dispatch(setOptions(options));
    dispatch(search(ownProps.baseQuery));
  },
});

export default connect(stateToProps, dispatchToProps)(
  convertSomeImmutablePropsToJS(EmbeddedLiteratureSearch, [
    'query',
    'sortOptions',
  ])
);
