import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'mome... Remove this comment to see the full error message
import moment from 'moment-timezone';
import { LOCAL_TIMEZONE } from '../constants';

const DATE_AND_TIME_DISPLAY_FORMAT = `MMM D, YYYY`;

type Props = {
    updateDate: string;
};

function RecordUpdateInfo({ updateDate }: Props) {
  const formattedDate = moment
    .utc(updateDate)
    .tz(LOCAL_TIMEZONE)
    .format(DATE_AND_TIME_DISPLAY_FORMAT);
  return <span className="light-silver">Updated on {formattedDate}</span>;
}

export default RecordUpdateInfo;
