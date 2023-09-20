import React, { ComponentPropsWithoutRef, useState } from 'react';
import { List } from 'immutable';

import InlineDataList from '../InlineList';
import ExpandListToggle from '../ExpandListToggle';

interface ExpandableInlineListProps extends ComponentPropsWithoutRef<any> {
  items: List<any>;
  limit: number;
}

const ExpandableInlineList = ({
  limit,
  items,
  ...listProps
}: ExpandableInlineListProps) => {
  const [expanded, setExpanded] = useState(false);
  const maybeLimitedItem = expanded ? items : items?.take(limit);

  const onExpandToggle = () => setExpanded(!expanded);

  if (!items) {
    return null;
  }
  return (
    <div>
      <InlineDataList items={maybeLimitedItem} {...listProps} />
      <ExpandListToggle
        limit={limit}
        size={items.size}
        expanded={expanded}
        onToggle={onExpandToggle}
      />
    </div>
  );
};

ExpandableInlineList.defaultProps = {
  ...InlineDataList.defaultProps,
  limit: 10,
};

export default ExpandableInlineList;
