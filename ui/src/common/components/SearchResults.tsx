import React from 'react';
import { List } from 'immutable';

import { getSearchRank } from '../utils';

const SearchResults = ({
  renderItem,
  isCatalogerLoggedIn,
  results,
  page,
  pageSize,
}: {
  renderItem: Function;
  isCatalogerLoggedIn: boolean;
  results: List<any>;
  page: number | undefined;
  pageSize: number | undefined;
}) => {
  return (
    <div data-test-id="search-results">
      {results.map((result, index) => (
        <div className="mv2" key={result.get('id')}>
          {renderItem(
            result,
            isCatalogerLoggedIn,
            getSearchRank(index, page || 1, pageSize || 25)
          )}
        </div>
      ))}
    </div>
  );
};

SearchResults.defaultProps = {
  results: List(),
};

export default SearchResults;
