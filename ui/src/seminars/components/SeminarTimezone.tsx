
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'mome... Remove this comment to see the full error message
import moment from 'moment-timezone';

type Props = {
    timezone: string;
};

function SeminarTimezone({ timezone }: Props) {
  return `Times in ${timezone} (${moment.tz(timezone).format('z')})`;
}

export default SeminarTimezone;
