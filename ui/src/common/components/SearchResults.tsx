import React from 'react';
import { List, is } from 'immutable';

import { getSearchRank } from '../utils';

const SearchResults = ({
  renderItem,
  isCatalogerLoggedIn,
  results,
  page,
  pageSize,
  isHoldingpen = false,
}: {
  renderItem: Function;
  isCatalogerLoggedIn: boolean;
  results: List<any>;
  page: number | undefined;
  pageSize: number | undefined;
  isHoldingpen?: boolean;
}) => {
  const renderResults = (result: any, index: number) => {
    if (!isHoldingpen) {
      return (
        <div className="mv2" key={result.get('id')}>
          {renderItem(
            result,
            isCatalogerLoggedIn,
            getSearchRank(index, page || 1, pageSize || 25)
          )}
        </div>
      );
    }
    return (
      <div className="mv2" key={result?.get('id')}>
        {renderItem(result)}
      </div>
    );
  };
  return (
    <div data-test-id="search-results">
      {results.map((result, index) => renderResults(result, index))}
    </div>
  );
};

SearchResults.defaultProps = {
  results: List(),
};

export default SearchResults;
