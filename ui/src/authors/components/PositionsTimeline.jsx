import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Timeline } from 'antd';
import { hasAnyOfKeys } from '../../common/utils';
import ExpandListToggle from '../../common/components/ExpandListToggle';

const DISPLAY_LIMIT = 5;

class PositionsTimeline extends Component {
  static renderPositionTimelineItem(position) {
    const institution = position.get('institution');
    const rank = position.get('rank');
    const dateDisplay = PositionsTimeline.getPositionDateDisplay(position);

    return (
      <Timeline.Item key={`#${dateDisplay}@${institution}`}>
        <div>{dateDisplay}</div>
        <div>
          {rank && <strong>{rank}, </strong>}
          <span>{institution}</span>
        </div>
      </Timeline.Item>
    );
  }

  static getPositionDateDisplay(position) {
    const current = position.get('current');
    const startDate = position.get('start_date');
    const endDate = position.get('end_date');

    const suffixedStartDateOrEmpty = startDate ? `${startDate}-` : '';

    if (current) {
      return `${suffixedStartDateOrEmpty}present`;
    }

    if (endDate) {
      return `${suffixedStartDateOrEmpty}${endDate}`;
    }

    if (startDate) {
      return startDate;
    }

    return null;
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

  shouldDisplayTimeline() {
    const { positions } = this.props;
    if (positions.size > 1) {
      return true;
    }

    const position = positions.first();
    return (
      !position.get('current') ||
      hasAnyOfKeys(position, ['start_date', 'end_date', 'rank'])
    );
  }

  render() {
    const { positions } = this.props;
    const { expanded } = this.state;

    const positionsToDisplay = expanded
      ? positions
      : positions.take(DISPLAY_LIMIT);

    return (
      this.shouldDisplayTimeline() && (
        <Fragment>
          <Timeline>
            {positionsToDisplay.map(
              PositionsTimeline.renderPositionTimelineItem
            )}
          </Timeline>
          <ExpandListToggle
            limit={DISPLAY_LIMIT}
            size={positions.size}
            expanded={expanded}
            onToggle={this.onExpandToggle}
          />
        </Fragment>
      )
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
