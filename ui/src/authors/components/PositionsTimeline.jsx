import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Timeline } from 'antd';
import { hasAnyOfKeys } from '../../common/utils';

class PositionsTimeline extends Component {
  static renderPositionTimelineItem(position) {
    const institution = position.get('institution');
    const rank = position.get('rank');
    const dateDisplay = PositionsTimeline.getPositionDateDisplay(position);

    return (
      <Timeline.Item>
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
    return (
      this.shouldDisplayTimeline() && (
        <Timeline>
          {positions.map(PositionsTimeline.renderPositionTimelineItem)}
        </Timeline>
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
