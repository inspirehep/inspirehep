import PropTypes from 'prop-types';
import moment from 'moment-timezone';

function SeminarTimezone({ timezone }) {
  return `Times in ${timezone} (${moment.tz(timezone).format('z')})`;
}

SeminarTimezone.propTypes = {
  timezone: PropTypes.string.isRequired,
};

export default SeminarTimezone;
