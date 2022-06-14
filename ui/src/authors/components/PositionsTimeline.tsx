import React, { Component, Fragment } from 'react';
import { List } from 'immutable';
import { Timeline } from 'antd';
import ExpandListToggle from '../../common/components/ExpandListToggle';
import Affiliation from '../../common/components/Affiliation';

const DISPLAY_LIMIT = 3;

type OwnProps = {
    positions?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type State = $TSFixMe;

type Props = OwnProps & typeof PositionsTimeline.defaultProps;

class PositionsTimeline extends Component<Props, State> {

static defaultProps = {
    positions: null,
};

  static renderPositionTimelineItem(position: $TSFixMe) {
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

  constructor(props: Props) {
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
          expandLabel="Show all positions"
        />
      </Fragment>
    );
  }
}

export default PositionsTimeline;
