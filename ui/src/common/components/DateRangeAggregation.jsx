import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DatePicker, Row } from 'antd';
import AggregationBox from './AggregationBox';
import {
  DATE_RANGE_FORMAT,
  RANGE_AGGREGATION_SELECTION_SEPARATOR,
} from '../constants';

function DateRangeAggregation({ name, onChange, selections }) {
  const [startDate = '', endDate = ''] = useMemo(
    () => selections.split(RANGE_AGGREGATION_SELECTION_SEPARATOR),
    [selections]
  );

  const startDateMoment = useMemo(
    () => (startDate ? moment.utc(startDate, DATE_RANGE_FORMAT) : null),
    [startDate]
  );

  const endDateMoment = useMemo(
    () => (endDate ? moment.utc(endDate, DATE_RANGE_FORMAT) : null),
    [endDate]
  );

  const isLaterThanEndDate = useCallback(
    dateAsMoment => {
      if (!dateAsMoment || !endDateMoment) {
        return false;
      }
      return dateAsMoment.isSameOrAfter(endDateMoment);
    },
    [endDateMoment]
  );

  const isEarlierThanStartDate = useCallback(
    dateAsMoment => {
      if (!dateAsMoment || !startDateMoment) {
        return false;
      }
      return dateAsMoment.isSameOrBefore(startDateMoment);
    },
    [startDateMoment]
  );

  const onStartDateChange = useCallback(
    (date, dateString) => {
      const willHaveAnySelectedDate = dateString || endDate;
      return onChange(
        willHaveAnySelectedDate
          ? `${dateString}${RANGE_AGGREGATION_SELECTION_SEPARATOR}${endDate}`
          : undefined
      );
    },
    [endDate, onChange]
  );

  const onEndDateChange = useCallback(
    (date, dateString) => {
      const willHaveAnySelectedDate = dateString || startDate;
      return onChange(
        willHaveAnySelectedDate
          ? `${startDate}${RANGE_AGGREGATION_SELECTION_SEPARATOR}${dateString}`
          : undefined
      );
    },
    [startDate, onChange]
  );

  return (
    <AggregationBox name={name}>
      <Row className="mb1">From:</Row>
      <Row className="mb2">
        <DatePicker
          data-test-id="start-date-picker"
          format={DATE_RANGE_FORMAT}
          className="w-100"
          onChange={onStartDateChange}
          value={startDateMoment}
          disabledDate={isLaterThanEndDate}
        />
      </Row>
      <Row className="mb1">To:</Row>
      <Row>
        <DatePicker
          data-test-id="end-date-picker"
          format={DATE_RANGE_FORMAT}
          onChange={onEndDateChange}
          className="w-100"
          value={endDateMoment}
          disabledDate={isEarlierThanStartDate}
        />
      </Row>
    </AggregationBox>
  );
}

DateRangeAggregation.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  selections: PropTypes.string,
};

DateRangeAggregation.defaultProps = {
  selections: '',
};

export default DateRangeAggregation;
