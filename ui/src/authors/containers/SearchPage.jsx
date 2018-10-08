import React, { Component } from 'react';
import SearchLayout from '../../common/layouts/SearchLayout';

import AuthorResultItem from '../components/AuthorResultItem';

class SearchPage extends Component {
  render() {
    return (
      <SearchLayout
        withoutSort
        withoutAggregations
        renderResultItem={result => (
          <AuthorResultItem metadata={result.get('metadata')} />
        )}
      />
    );
  }
}

export default SearchPage;
