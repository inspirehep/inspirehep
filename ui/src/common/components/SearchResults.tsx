import React, { Component } from 'react';
import Immutable from 'immutable';

import { getSearchRank } from '../utils';

type OwnProps = {
    results?: $TSFixMe; // TODO: PropTypes.instanceOf(Immutable.List)
    isCatalogerLoggedIn?: boolean;
    renderItem: $TSFixMeFunction;
    page: number;
    pageSize: number;
};

type Props = OwnProps & typeof SearchResults.defaultProps;

class SearchResults extends Component<Props> {

static defaultProps = {
    results: Immutable.List(),
};

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
        {results.map((result: $TSFixMe, index: $TSFixMe) => (
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

export default SearchResults;
