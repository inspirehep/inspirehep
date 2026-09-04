import { useState } from 'react';
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

  function getPositionTimelineItem(position: Map<string, any>) {
    const rank = position.get('rank');
    const displayDate = position.get('display_date');

    return {
      children: (
        <>
          <div>{displayDate}</div>
          <div>
            {rank && <strong>{rank}, </strong>}
            <Affiliation affiliation={position} />
          </div>
        </>
      ),
    };
  }

  return (
    <>
      <Timeline
        items={positionsToDisplay.map(getPositionTimelineItem).toArray()}
      />
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

export default PositionsTimeline;
