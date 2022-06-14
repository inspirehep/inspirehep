import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import ExpandableInlineList from '../../common/components/ExpandableInlineList';
import UnclickableTag from '../../common/components/UnclickableTag';

function renderCategory(category) {
  const term = category.get('term');
  return <UnclickableTag>{term}</UnclickableTag>;
}

function InspireCategoryList({ categories }) {
  return (
    <ExpandableInlineList
      separateItems={false}
      wrapperClassName="di"
      items={categories}
      extractKey={category => category.get('term')}
      renderItem={renderCategory}
    />
  );
}

InspireCategoryList.propTypes = {
  categories: PropTypes.instanceOf(List),
};

export default InspireCategoryList;
