import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';

import { getSearchRank } from '../utils';

class SearchResults extends Component {
  render() {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'renderItem' does not exist on type 'Read... Remove this comment to see the full error message
      renderItem,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'isCatalogerLoggedIn' does not exist on t... Remove this comment to see the full error message
      isCatalogerLoggedIn,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'results' does not exist on type 'Readonl... Remove this comment to see the full error message
      results,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'page' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      page,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'pageSize' does not exist on type 'Readon... Remove this comment to see the full error message
      pageSize,
    } = this.props;
    return (
      <div data-test-id="search-results">
        {results.map((result: any, index: any) => (
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
SearchResults.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  results: PropTypes.instanceOf(Immutable.List),
  isCatalogerLoggedIn: PropTypes.bool,
  renderItem: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
SearchResults.defaultProps = {
  results: Immutable.List(),
};

export default SearchResults;
