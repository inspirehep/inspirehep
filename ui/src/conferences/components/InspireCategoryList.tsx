import React from 'react';
import { List } from 'immutable';

import ExpandableInlineList from '../../common/components/ExpandableInlineList';
import UnclickableTag from '../../common/components/UnclickableTag';

function renderCategory(category: $TSFixMe) {
  const term = category.get('term');
  return <UnclickableTag>{term}</UnclickableTag>;
}

type Props = {
    categories?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

function InspireCategoryList({ categories }: Props) {
  return (
    <ExpandableInlineList
      separateItems={false}
      wrapperClassName="di"
      items={categories}
      extractKey={(category: $TSFixMe) => category.get('term')}
      renderItem={renderCategory}
    />
  );
}

export default InspireCategoryList;
