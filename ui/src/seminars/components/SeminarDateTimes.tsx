import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'mome... Remove this comment to see the full error message
import moment from 'moment-timezone';
import { TIME_FORMAT } from '../../common/constants';

type OwnProps = {
    startDate: string;
    endDate: string;
    timezone: string;
    displayTimezone?: boolean;
    className?: string;
};

// @ts-expect-error ts-migrate(2565) FIXME: Property 'defaultProps' is used before being assig... Remove this comment to see the full error message
type Props = OwnProps & typeof SeminarDateTimes.defaultProps;

function SeminarDateTimes({ startDate, endDate, timezone, displayTimezone, className, }: Props) {
  const startMoment = moment.utc(startDate).tz(timezone);
  const endMoment = moment.utc(endDate).tz(timezone);
  const DATE_AND_TIME_DISPLAY_FORMAT = `D MMMM YYYY, ${TIME_FORMAT}`;
  const startDateDisplay = startMoment.format(DATE_AND_TIME_DISPLAY_FORMAT);
  const endDateDisplay = startMoment.isSame(endMoment, 'day')
    ? endMoment.format(TIME_FORMAT)
    : endMoment.format(DATE_AND_TIME_DISPLAY_FORMAT);
  return (
    <span className={className}>
      {startDateDisplay} - {endDateDisplay}
      {displayTimezone ? ` ${moment.tz(timezone).format('z')}` : ''}
    </span>
  );
}
SeminarDateTimes.defaultProps = {
  displayTimezone: false,
};

export default SeminarDateTimes;
