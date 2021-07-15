import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';

import { getSearchRank } from '../utils';

class SearchResults extends Component {
  render() {
    const {
      renderItem,
      isCatalogerLoggedIn,
      results,
      page,
      pageSize,
    } = this.props;
    return (
      <div data-test-id="search-results">
        {results.map((result, index) => (
          <div className="mv2" key={result.get('id')}>
            {renderItem(
              result,
              isCatalogerLoggedIn,
              getSearchRank(index, page, pageSize)
            )}
          </div>
        ))}
      </div>
    );
  }
}

SearchResults.propTypes = {
  results: PropTypes.instanceOf(Immutable.List),
  isCatalogerLoggedIn: PropTypes.bool,
  renderItem: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
};

SearchResults.defaultProps = {
  results: Immutable.List(),
};

export default SearchResults;
