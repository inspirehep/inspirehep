import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { LOCAL_TIMEZONE } from '../constants';

const DATE_AND_TIME_DISPLAY_FORMAT = `MMM D, YYYY`;

function RecordUpdateInfo({ updateDate }) {
  const formattedDate = moment
    .utc(updateDate)
    .tz(LOCAL_TIMEZONE)
    .format(DATE_AND_TIME_DISPLAY_FORMAT);
  return <span className="light-silver">Updated on {formattedDate}</span>;
}

RecordUpdateInfo.propTypes = { updateDate: PropTypes.string.isRequired };

export default RecordUpdateInfo;
