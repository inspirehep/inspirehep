import React from 'react';
import { List, Map } from 'immutable';

import ExpandableInlineList from './ExpandableInlineList';
import UnclickableTag from './UnclickableTag';

function renderKeyword(keyword: Map<string, any>) {
  const keywordValue = keyword.get('value');
  return <UnclickableTag color="blue">{keywordValue}</UnclickableTag>;
}

    const KeywordList = ({ keywords }: { keywords: List<any> }) => {
    return (
      <ExpandableInlineList
        separateItems={false}
        wrapperClassName="di"
        items={keywords}
        extractKey={(keyword: Map<string, any>) => keyword.get('value')}
        renderItem={renderKeyword}
        limit={10}
      />
    );
  }

KeywordList.defaultProps = {
  keywords: null,
};

export default KeywordList;
