import { useCallback, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Row, Switch, Col } from 'antd';

// TODO: rename AggregationBox to FilterBox, since it is used for this (Filter) and AggregationFilter
import AggregationBox from './AggregationBox';
import DateRangeFilter from './DateRangeFilter';
import { START_DATE_UPCOMING, START_DATE_ALL } from '../constants';
import EventTracker from './EventTracker';

function EventStartDateFilter({ onChange, selection = '', switchTitle }) {
  const [isUpcoming, setUpcoming] = useState(selection === START_DATE_UPCOMING);

  useEffect(() => {
    setUpcoming(selection === START_DATE_UPCOMING);
  }, [selection]);

  const isDateRangeSelected =
    selection !== START_DATE_UPCOMING && selection !== START_DATE_ALL;
  const selectedRange = isDateRangeSelected ? selection : '';

  const pendingChangeRef = useRef(false);
  const onUpcomingSwitchChange = useCallback((checked) => {
    setUpcoming(checked);
    pendingChangeRef.current = true;
  }, []);
  const onUpcomingSwitchTransitionEnd = useCallback(() => {
    // antd 5's Switch also fires transitionend on hover (box-shadow), and a
    // toggle transitions multiple properties, so transitionend fires on hover
    // and several times per change: only react to the first one that follows a
    // real toggle, ignoring hover-triggered transitions
    if (pendingChangeRef.current) {
      onChange(isUpcoming ? START_DATE_UPCOMING : START_DATE_ALL);
      pendingChangeRef.current = false;
    }
  }, [onChange, isUpcoming]);

  const onDateRangeFilterChange = useCallback(
    (range) => {
      onChange(range || START_DATE_ALL);
    },
    [onChange]
  );

  return (
    <Row className="pa3 bg-white mb3" data-testid="event-start-date-filter">
      <AggregationBox name="Start Date" className="mb3">
        <Row className="mb3" type="flex" align="middle" gutter={8}>
          <Col>
            <EventTracker
              eventId="show upcoming conferences"
              eventCategory="Conferences search"
              eventAction="Start date facet"
              eventPropName="onChange"
            >
              <Switch
                checked={isUpcoming}
                onChange={onUpcomingSwitchChange}
                // if onChange is called before the toggle transition, it slows down & freezes it
                // because onChange() triggers search requests and eventually rendering aggs/results
                // which is already a lot of events/task that have priority over animation in browsers
                onTransitionEnd={onUpcomingSwitchTransitionEnd}
              />
            </EventTracker>
          </Col>
          <Col>{switchTitle}</Col>
        </Row>
        <EventTracker
          eventId="date range"
          eventCategory="Conferences search"
          eventAction="Start date facet"
          eventPropName="onChange"
        >
          <DateRangeFilter
            onChange={onDateRangeFilterChange}
            range={selectedRange}
          />
        </EventTracker>
      </AggregationBox>
    </Row>
  );
}

EventStartDateFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  selection: PropTypes.string,
  switchTitle: PropTypes.string.isRequired,
};

export default EventStartDateFilter;
