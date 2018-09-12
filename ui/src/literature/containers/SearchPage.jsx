import React, { Component } from 'react';
import SearchLayout from '../../common/layouts/SearchLayout';

import LiteratureItem from '../components/LiteratureItem';

class SearchPage extends Component {
  render() {
    return (
      <SearchLayout
        renderResultItem={result => (
          <LiteratureItem metadata={result.get('metadata')} />
        )}
      />
    );
  }
}

export default SearchPage;
