import React, { useState } from 'react';
import { List, Map } from 'immutable';
import { Timeline } from 'antd';

import ExpandListToggle from '../../common/components/ExpandListToggle';
import Affiliation from '../../common/components/Affiliation';

const DISPLAY_LIMIT = 3;

const PositionsTimeline = ({ positions }: { positions: List<any> }) => {
  const [expanded, setExpanded] = useState(false);

  const positionsToDisplay = expanded
    ? positions
    : positions.take(DISPLAY_LIMIT);

  function renderPositionTimelineItem(position: Map<string, any>) {
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

  return (
    <>
      <Timeline>{positionsToDisplay.map(renderPositionTimelineItem)}</Timeline>
      <ExpandListToggle
        limit={DISPLAY_LIMIT}
        size={positions.size}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        expandLabel="Show all positions"
      />
    </>
  );
};

PositionsTimeline.defaultProps = {
  positions: null,
};

export default PositionsTimeline;
