import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { DatePicker, Row } from 'antd';

import {
  RANGE_AGGREGATION_SELECTION_SEPARATOR,
  DATE_RANGE_FORMAT,
} from '../constants';

dayjs.extend(utc);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

function DateRangeFilter({ onChange, range = '' }) {
  const [startDate = '', endDate = ''] = useMemo(
    () => range.split(RANGE_AGGREGATION_SELECTION_SEPARATOR),
    [range]
  );

  const startDateDayjs = useMemo(
    () => (startDate ? dayjs.utc(startDate, DATE_RANGE_FORMAT) : null),
    [startDate]
  );

  const endDateDayjs = useMemo(
    () => (endDate ? dayjs.utc(endDate, DATE_RANGE_FORMAT) : null),
    [endDate]
  );

  const isLaterThanEndDate = useCallback(
    (dateAsDayjs) => {
      if (!dateAsDayjs || !endDateDayjs) {
        return false;
      }
      return dateAsDayjs.isSameOrAfter(endDateDayjs);
    },
    [endDateDayjs]
  );

  const isEarlierThanStartDate = useCallback(
    (dateAsDayjs) => {
      if (!dateAsDayjs || !startDateDayjs) {
        return false;
      }
      return dateAsDayjs.isSameOrBefore(startDateDayjs);
    },
    [startDateDayjs]
  );

  const onStartDateChange = useCallback(
    (_, dateString) => {
      const willHaveAnySelectedDate = dateString || endDate;
      onChange(
        willHaveAnySelectedDate
          ? `${dateString}${RANGE_AGGREGATION_SELECTION_SEPARATOR}${endDate}`
          : undefined
      );
    },
    [endDate, onChange]
  );

  const onEndDateChange = useCallback(
    (_, dateString) => {
      const willHaveAnySelectedDate = dateString || startDate;
      onChange(
        willHaveAnySelectedDate
          ? `${startDate}${RANGE_AGGREGATION_SELECTION_SEPARATOR}${dateString}`
          : undefined
      );
    },
    [startDate, onChange]
  );

  return (
    <div>
      <Row className="mb1">From:</Row>
      <Row className="mb2">
        <DatePicker
          data-test-id="start-date-picker"
          data-testid="start-date-picker"
          format={DATE_RANGE_FORMAT}
          className="w-100"
          onChange={onStartDateChange}
          value={startDateDayjs}
          disabledDate={isLaterThanEndDate}
        />
      </Row>
      <Row className="mb1">To:</Row>
      <Row>
        <DatePicker
          data-test-id="end-date-picker"
          data-testid="end-date-picker"
          format={DATE_RANGE_FORMAT}
          onChange={onEndDateChange}
          className="w-100"
          value={endDateDayjs}
          disabledDate={isEarlierThanStartDate}
        />
      </Row>
    </div>
  );
}

DateRangeFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  range: PropTypes.string,
};

export default DateRangeFilter;
