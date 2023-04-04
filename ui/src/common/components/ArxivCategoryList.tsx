import React from 'react';
import { List } from 'immutable';

import UnclickableTag from './UnclickableTag';
import InlineDataList from './InlineList';

function ArxivCategoryList({
  arxivCategories,
  wrapperClassName,
}: {
  arxivCategories: List<any>;
  wrapperClassName: string;
}) {
  function renderArxivCategory(category: string) {
    return <UnclickableTag>{category}</UnclickableTag>;
  }

  return (
    <InlineDataList
      separateItems={false}
      items={arxivCategories}
      renderItem={renderArxivCategory}
      wrapperClassName={wrapperClassName}
    />
  );
}

ArxivCategoryList.defaultProps = {
  arxivCategories: null,
  wrapperClassName: null,
};

export default ArxivCategoryList;
