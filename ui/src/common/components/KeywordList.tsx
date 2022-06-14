import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import ExpandableInlineList from './ExpandableInlineList';
import UnclickableTag from './UnclickableTag';

function renderKeyword(keyword: any) {
  const keywordValue = keyword.get('value');
  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
  return <UnclickableTag color="blue">{keywordValue}</UnclickableTag>;
}

class KeywordList extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'keywords' does not exist on type 'Readon... Remove this comment to see the full error message
    const { keywords } = this.props;
    return (
      <ExpandableInlineList
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ separateItems: boolean; wrapperClassName: ... Remove this comment to see the full error message
        separateItems={false}
        wrapperClassName="di"
        items={keywords}
        extractKey={(keyword: any) => keyword.get('value')}
        renderItem={renderKeyword}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
KeywordList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  keywords: PropTypes.instanceOf(List),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
KeywordList.defaultProps = {
  keywords: null,
};

export default KeywordList;
