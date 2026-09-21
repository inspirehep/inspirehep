import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import dayjsTimezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { TIME_FORMAT } from '../../common/constants';

dayjs.extend(utc);
dayjs.extend(dayjsTimezone);
dayjs.extend(advancedFormat);

function SeminarDateTimes({
  startDate,
  endDate,
  timezone,
  displayTimezone = false,
  className,
}) {
  const startDayjs = dayjs.utc(startDate).tz(timezone);
  const endDayjs = dayjs.utc(endDate).tz(timezone);
  const DATE_AND_TIME_DISPLAY_FORMAT = `D MMMM YYYY, ${TIME_FORMAT}`;
  const startDateDisplay = startDayjs.format(DATE_AND_TIME_DISPLAY_FORMAT);
  const endDateDisplay = startDayjs.isSame(endDayjs, 'day')
    ? endDayjs.format(TIME_FORMAT)
    : endDayjs.format(DATE_AND_TIME_DISPLAY_FORMAT);
  return (
    <span className={className}>
      {startDateDisplay} - {endDateDisplay}
      {displayTimezone ? ` ${dayjs().tz(timezone).format('z')}` : ''}
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

export default SeminarDateTimes;
