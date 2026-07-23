import { List } from 'immutable';

import { getSearchRank } from '../utils';

const SearchResults = ({
  renderItem,
  isCatalogerLoggedIn,
  results = List(),
  page,
  pageSize,
}: {
  renderItem: Function;
  isCatalogerLoggedIn: boolean;
  results?: List<any>;
  page: number | undefined;
  pageSize: number | undefined;
}) => {
  const renderResults = (result: any, index: number) => (
    <div className="mv2" key={result.get('id')}>
      {renderItem(
        result,
        isCatalogerLoggedIn,
        getSearchRank(index, page || 1, pageSize || 25)
      )}
    </div>
  );
  return (
    <div data-testid="search-results">
      {results.map((result, index) => renderResults(result, index))}
    </div>
  );
};

export default SearchResults;
