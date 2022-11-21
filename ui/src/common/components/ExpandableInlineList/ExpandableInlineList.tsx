import React, { useState } from 'react';
import { List } from 'immutable';

import InlineDataList from '../InlineList';
import ExpandListToggle from '../ExpandListToggle';

const ExpandableInlineList = ({
  limit,
  items,
  ...listProps
}: {
  limit: number;
  items: List<any>;
  listProps: any;
}) => {
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
