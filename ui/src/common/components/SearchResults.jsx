import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';

class SearchResults extends Component {
  render() {
    const { renderItem, results } = this.props;
    return (
      <div>
        {results.map(result => (
          <div className="mv3" key={result.get('id')}>
            {renderItem(result)}
          </div>
        ))}
      </div>
    );
  }
}

SearchResults.propTypes = {
  results: PropTypes.instanceOf(Immutable.List),
  renderItem: PropTypes.func.isRequired,
};

SearchResults.defaultProps = {
  results: Immutable.List(),
};

export default SearchResults;
