import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList, {
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';
import { RANK_VALUE_TO_DISPLAY } from '../../common/constants';

class RanksList extends Component {
  static renderRank(rank: any) {
    {/* @ts-ignore */}
    return RANK_VALUE_TO_DISPLAY[rank];
  }

  render() {
    {/* @ts-ignore */}
    const { ranks } = this.props;
    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        items={ranks}
        renderItem={RanksList.renderRank}
        separator={SEPARATOR_MIDDLEDOT}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
RanksList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  ranks: PropTypes.instanceOf(List),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
RanksList.defaultProps = {
  ranks: null,
};

export default RanksList;
