import React from 'react';
import { FileSearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import IconText from './IconText';
import { LITERATURE } from '../routes';
import ListItemAction from './ListItemAction';
import EventTracker from './EventTracker';

const ReferenceSearchLinkAction = ({ recordId }: { recordId: number}) => (
  <ListItemAction>
    <EventTracker eventId="Reference:Search">
      <Link to={`${LITERATURE}?q=citedby:recid:${recordId}`} data-test-id="reference-search-button">
        <IconText text="reference search" icon={<FileSearchOutlined />} />
      </Link>
    </EventTracker>
  </ListItemAction>
);

export default ReferenceSearchLinkAction;
