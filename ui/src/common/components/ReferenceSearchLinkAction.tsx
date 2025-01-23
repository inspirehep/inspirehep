import React from 'react';
import { FileSearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import IconText from './IconText';
import { LITERATURE } from '../routes';
import UserAction from './UserAction';
import EventTracker from './EventTracker';

const ReferenceSearchLinkAction = ({
  recordId,
  page,
}: {
  recordId: number;
  page: string;
}) => (
  <UserAction>
    <EventTracker
      eventCategory={page}
      eventAction="Search"
      eventId="Reference search"
    >
      <Link
        to={`${LITERATURE}?q=citedby:recid:${recordId}`}
        data-test-id="reference-search-button"
      >
        <IconText text="reference search" icon={<FileSearchOutlined />} />
      </Link>
    </EventTracker>
  </UserAction>
);

export default ReferenceSearchLinkAction;
