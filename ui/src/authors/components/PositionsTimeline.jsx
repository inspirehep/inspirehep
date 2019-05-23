import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Timeline } from 'antd';
import ExpandListToggle from '../../common/components/ExpandListToggle';

const DISPLAY_LIMIT = 2;

class PositionsTimeline extends Component {
  static renderPositionTimelineItem(position) {
    const institution = position.get('institution');
    const rank = position.get('rank');
    const displayDate = position.get('display_date');

    return (
      <Timeline.Item key={`#${displayDate}@${institution}`}>
        <div>{displayDate}</div>
        <div>
          {rank && <strong>{rank}, </strong>}
          <span>{institution}</span>
        </div>
      </Timeline.Item>
    );
  }

  constructor(props) {
    super(props);

    this.state = { expanded: false };
    this.onExpandToggle = this.onExpandToggle.bind(this);
  }

  onExpandToggle() {
    const { expanded } = this.state;
    this.setState({ expanded: !expanded });
  }

  render() {
    const { positions } = this.props;
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
          limit={DISPLAY_LIMIT}
          size={positions.size}
          expanded={expanded}
          onToggle={this.onExpandToggle}
        />
      </Fragment>
    );
  }
}

PositionsTimeline.propTypes = {
  positions: PropTypes.instanceOf(List),
};

PositionsTimeline.defaultProps = {
  positions: null,
};

export default PositionsTimeline;
