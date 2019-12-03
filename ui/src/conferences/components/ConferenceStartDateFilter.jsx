import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { Row, Switch, Col } from 'antd';

import AggregationBox from '../../common/components/AggregationBox';
import DateRangeFilter from '../../common/components/DateRangeFilter';
import { START_DATE_UPCOMING, START_DATE_ALL } from '../../common/constants';



function ConferenceStartDateFilter({ onChange, selection = '' }) {
  const [isUpcoming, setUpcoming] = useState(selection === START_DATE_UPCOMING);

  useEffect(
    () => {
      setUpcoming(selection === START_DATE_UPCOMING);
    },
    [selection]
  );

  const isDateRangeSelected = selection !== START_DATE_UPCOMING && selection !== START_DATE_ALL;
  const selectedRange = isDateRangeSelected ? selection : '';

  const onChangeCalledAfterChangeRef = useRef(false);
  const onUpcomingSwitchChange = useCallback(checked => {
    setUpcoming(checked);
    onChangeCalledAfterChangeRef.current = false;
  }, []);
  const onUpcomingSwitchAnimationEnd = useCallback(
    () => {
      // because onAnimatonEnd called twice
      if (!onChangeCalledAfterChangeRef.current) {
        onChange(isUpcoming ? START_DATE_UPCOMING : START_DATE_ALL);
        onChangeCalledAfterChangeRef.current = true;
      }
    },
    [onChange, isUpcoming]
  );

  const onDateRangeFilterChange = useCallback(
    range => {
      onChange(range || START_DATE_ALL);
    },
    [onChange]
  );

  return (
    <Row className="pa3 bg-white mb3">
      <AggregationBox name="Start Date">
        <Row className="mb3" type="flex" align="middle" gutter={8}>
          <Col>
            <Switch
              checked={isUpcoming}
              onChange={onUpcomingSwitchChange}
              // if onChange is called before animation, it slows down & freezes the animation
              // because onChange() triggers search requests and eventually rendering aggs/results
              // which is already a lot of events/task that have priority over animation in browsers
              onAnimationEnd={onUpcomingSwitchAnimationEnd}
            />
          </Col>
          <Col>Upcoming conferences</Col>
        </Row>
        <DateRangeFilter
          onChange={onDateRangeFilterChange}
          range={selectedRange}
        />
      </AggregationBox>
    </Row>
  );
}

ConferenceStartDateFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  selection: PropTypes.string,
};

export default ConferenceStartDateFilter;
