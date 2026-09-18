import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { LOCAL_TIMEZONE } from '../constants';

dayjs.extend(utc);
dayjs.extend(timezone);

const DATE_AND_TIME_DISPLAY_FORMAT = `MMM D, YYYY`;

function RecordUpdateInfo({ updateDate }) {
  const formattedDate = dayjs
    .utc(updateDate)
    .tz(LOCAL_TIMEZONE)
    .format(DATE_AND_TIME_DISPLAY_FORMAT);
  return <span className="light-silver">Updated on {formattedDate}</span>;
}

RecordUpdateInfo.propTypes = { updateDate: PropTypes.string.isRequired };

export default RecordUpdateInfo;
