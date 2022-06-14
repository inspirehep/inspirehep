import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { TIME_FORMAT } from '../../common/constants';

function SeminarDateTimes({
  startDate,
  endDate,
  timezone,
  displayTimezone,
  className,
}) {
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

SeminarDateTimes.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  timezone: PropTypes.string.isRequired,
  displayTimezone: PropTypes.bool,
  className: PropTypes.string,
};
SeminarDateTimes.defaultProps = {
  displayTimezone: false,
};

export default SeminarDateTimes;
