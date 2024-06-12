import React from 'react';
import moment from 'moment-timezone';

function SeminarTimezone({ timezone }: { timezone: string }) {
  return <>{`Times in ${timezone} (${moment.tz(timezone).format('z')})`}</>;
}

export default SeminarTimezone;
