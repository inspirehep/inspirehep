import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import ExpandableInlineList from './ExpandableInlineList';
import UnclickableTag from './UnclickableTag';

function renderKeyword(keyword) {
  const keywordValue = keyword.get('value');
  return <UnclickableTag color="blue">{keywordValue}</UnclickableTag>;
}

class KeywordList extends Component {
  render() {
    const { keywords } = this.props;
    return (
      <ExpandableInlineList
        separateItems={false}
        wrapperClassName="di"
        items={keywords}
        extractKey={keyword => keyword.get('value')}
        renderItem={renderKeyword}
      />
    );
  }
}

KeywordList.propTypes = {
  keywords: PropTypes.instanceOf(List),
};

KeywordList.defaultProps = {
  keywords: null,
};

export default KeywordList;
