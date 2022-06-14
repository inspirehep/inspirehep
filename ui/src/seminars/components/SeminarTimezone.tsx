import PropTypes from 'prop-types';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'mome... Remove this comment to see the full error message
import moment from 'moment-timezone';

function SeminarTimezone({
  timezone
}: any) {
  return `Times in ${timezone} (${moment.tz(timezone).format('z')})`;
}

SeminarTimezone.propTypes = {
  timezone: PropTypes.string.isRequired,
};

export default SeminarTimezone;
