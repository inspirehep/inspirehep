import React from 'react';

import './SearchPageContainer.less';

interface SearchPageContainerProps {
  data?: any;
}

const SearchPageContainer: React.FC<SearchPageContainerProps> = () => {
  return (
    <div
      className="__SearchPageContainer__"
      data-testid="holdingpen-search-page"
    >
      Search Page
    </div>
  );
};

export default SearchPageContainer;
