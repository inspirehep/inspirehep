import { useCallback } from 'react';
import { Row, Switch, Col } from 'antd';

// TODO: rename AggregationBox to FilterBox, since it is used for this (Filter) and AggregationFilter
import AggregationBox from './AggregationBox';
import DateRangeFilter from './DateRangeFilter';
import { START_DATE_UPCOMING, START_DATE_ALL } from '../constants';
import EventTracker from './EventTracker';

type EventStartDateFilterProps = {
  onChange: (value: string) => void;
  selection?: string;
  switchTitle: string;
};

function EventStartDateFilter({
  onChange,
  selection = '',
  switchTitle,
}: EventStartDateFilterProps) {
  const isUpcoming = selection === START_DATE_UPCOMING;

  const isDateRangeSelected =
    selection !== START_DATE_UPCOMING && selection !== START_DATE_ALL;

  const selectedRange = isDateRangeSelected ? selection : '';

  const onUpcomingSwitchChange = useCallback(
    (checked: boolean) => {
      onChange(checked ? START_DATE_UPCOMING : START_DATE_ALL);
    },
    [onChange]
  );

  const onDateRangeFilterChange = useCallback(
    (range?: string) => {
      onChange(range || START_DATE_ALL);
    },
    [onChange]
  );

  return (
    <Row className="pa3 bg-white mb3" data-testid="event-start-date-filter">
      <AggregationBox name="Start Date" className="mb3">
        <Row className="mb3" align="middle" gutter={8}>
          <Col>
            <EventTracker
              eventId="show upcoming conferences"
              eventCategory="Conferences search"
              eventAction="Start date facet"
              eventPropName="onChange"
            >
              <Switch checked={isUpcoming} onChange={onUpcomingSwitchChange} />
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

export default EventStartDateFilter;
