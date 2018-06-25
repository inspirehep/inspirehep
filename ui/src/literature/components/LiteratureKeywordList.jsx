import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import LiteratureKeyword from './LiteratureKeyword';
import ExpandableInlineList from '../../common/components/ExpandableInlineList';

class LiteratureKeywordList extends Component {
  render() {
    const { keywords } = this.props;
    return (
      <ExpandableInlineList
        separateItems={false}
        wrapperClassName="di"
        items={keywords}
        extractKey={keyword => keyword.get('value')}
        renderItem={keyword => <LiteratureKeyword keyword={keyword} />}
      />
    );
  }
}

LiteratureKeywordList.propTypes = {
  keywords: PropTypes.instanceOf(List),
};

LiteratureKeywordList.defaultProps = {
  keywords: null,
};

export default LiteratureKeywordList;
