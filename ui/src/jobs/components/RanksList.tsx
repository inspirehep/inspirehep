import React, { Component } from 'react';
import { List } from 'immutable';

import InlineList, {
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';
import { RANK_VALUE_TO_DISPLAY } from '../../common/constants';

type OwnProps = {
    ranks?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type Props = OwnProps & typeof RanksList.defaultProps;

class RanksList extends Component<Props> {

static defaultProps = {
    ranks: null,
};

  static renderRank(rank: $TSFixMe) {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
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

export default RanksList;
