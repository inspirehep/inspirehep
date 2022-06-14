import React, { Component } from 'react';
import { List } from 'immutable';

import ExpandableInlineList from './ExpandableInlineList';
import UnclickableTag from './UnclickableTag';

function renderKeyword(keyword: $TSFixMe) {
  const keywordValue = keyword.get('value');
  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
  return <UnclickableTag color="blue">{keywordValue}</UnclickableTag>;
}

type OwnProps = {
    keywords?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type Props = OwnProps & typeof KeywordList.defaultProps;

class KeywordList extends Component<Props> {

static defaultProps = {
    keywords: null,
};

  render() {
    const { keywords } = this.props;
    return (
      <ExpandableInlineList
        separateItems={false}
        wrapperClassName="di"
        items={keywords}
        extractKey={(keyword: $TSFixMe) => keyword.get('value')}
        renderItem={renderKeyword}
      />
    );
  }
}

export default KeywordList;
