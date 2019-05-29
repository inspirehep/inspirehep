import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

class RanksList extends Component {
  render() {
    const { ranks } = this.props;
    return (
      <InlineList
        items={ranks}
        separateItemsClassName="separate-items-with-middledot"
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
