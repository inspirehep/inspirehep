import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList, {
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';
import { RANK_VALUE_TO_DISPLAY } from '../../common/constants';

class RanksList extends Component {
  static renderRank(rank) {
    return RANK_VALUE_TO_DISPLAY[rank];
  }

  render() {
    const { ranks } = this.props;
    return (
      <InlineList
        items={ranks}
        renderItem={RanksList.renderRank}
        separator={SEPARATOR_MIDDLEDOT}
      />
    );
  }
}

RanksList.propTypes = {
  ranks: PropTypes.instanceOf(List),
};

RanksList.defaultProps = {
  ranks: null,
};

export default RanksList;
