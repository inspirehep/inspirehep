import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import dayjsTimezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(utc);
dayjs.extend(dayjsTimezone);
dayjs.extend(advancedFormat);

function SeminarTimezone({ timezone }) {
  return `Times in ${timezone} (${dayjs().tz(timezone).format('z')})`;
}

SeminarTimezone.propTypes = {
  timezone: PropTypes.string.isRequired,
};

export default SeminarTimezone;
