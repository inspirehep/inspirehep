import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Timeline } from 'antd';
import ExpandListToggle from '../../common/components/ExpandListToggle';
import Affiliation from '../../common/components/Affiliation';

const DISPLAY_LIMIT = 3;

class PositionsTimeline extends Component {
  static renderPositionTimelineItem(position: any) {
    const institution = position.get('institution');
    const rank = position.get('rank');
    const displayDate = position.get('display_date');

    return (
      <Timeline.Item key={`#${displayDate}@${institution}`}>
        <div>{displayDate}</div>
        <div>
          {rank && <strong>{rank}, </strong>}
          <Affiliation affiliation={position} />
        </div>
      </Timeline.Item>
    );
  }

  constructor(props: any) {
    super(props);

    this.state = { expanded: false };
    this.onExpandToggle = this.onExpandToggle.bind(this);
  }

  onExpandToggle() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'expanded' does not exist on type 'Readon... Remove this comment to see the full error message
    const { expanded } = this.state;
    this.setState({ expanded: !expanded });
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'positions' does not exist on type 'Reado... Remove this comment to see the full error message
    const { positions } = this.props;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'expanded' does not exist on type 'Readon... Remove this comment to see the full error message
    const { expanded } = this.state;

    const positionsToDisplay = expanded
      ? positions
      : positions.take(DISPLAY_LIMIT);

    return (
      <Fragment>
        <Timeline>
          {positionsToDisplay.map(PositionsTimeline.renderPositionTimelineItem)}
        </Timeline>
        <ExpandListToggle
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          limit={DISPLAY_LIMIT}
          size={positions.size}
          expanded={expanded}
          onToggle={this.onExpandToggle}
          expandLabel="Show all positions"
        />
      </Fragment>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
PositionsTimeline.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  positions: PropTypes.instanceOf(List),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
PositionsTimeline.defaultProps = {
  positions: null,
};

export default PositionsTimeline;
