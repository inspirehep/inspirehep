import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';

import EventTracker from '../EventTracker';
import FormattedNumber from '../FormattedNumber';

function TabNameWithCount({
  name,
  loading,
  count,
  page,
}: {
  name: string;
  loading: boolean;
  count: number;
  page: string;
}) {
  return (
    <EventTracker
      eventCategory={page}
      eventAction="Tab selection"
      eventId={`${name} tab`}
    >
      <span>
        <span>{name}</span>
        <span className="ml1">
          {loading ? (
            <span data-test-id="loading">
              <LoadingOutlined className="ml1" spin />
            </span>
          ) : (
            count != null && (
              <span>
                (<FormattedNumber>{count}</FormattedNumber>)
              </span>
            )
          )}
        </span>
      </span>
    </EventTracker>
  );
}

TabNameWithCount.defaultProps = {
  count: null,
  loading: false,
};

export default TabNameWithCount;
