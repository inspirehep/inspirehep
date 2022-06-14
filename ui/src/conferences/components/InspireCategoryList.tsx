import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import ExpandableInlineList from '../../common/components/ExpandableInlineList';
import UnclickableTag from '../../common/components/UnclickableTag';

function renderCategory(category: any) {
  const term = category.get('term');
  return <UnclickableTag>{term}</UnclickableTag>;
}

function InspireCategoryList({
  categories
}: any) {
  return (
    <ExpandableInlineList
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ separateItems: boolean; wrapperClassName: ... Remove this comment to see the full error message
      separateItems={false}
      wrapperClassName="di"
      items={categories}
      extractKey={(category: any) => category.get('term')}
      renderItem={renderCategory}
    />
  );
}

InspireCategoryList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  categories: PropTypes.instanceOf(List),
};

export default InspireCategoryList;
