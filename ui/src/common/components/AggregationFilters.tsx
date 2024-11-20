import React from 'react';
import { Map } from 'immutable';
import { Row, Col } from 'antd';
import className from 'classnames';

import AggregationFilter from './AggregationFilter';
import EventTracker from './EventTracker';

function getClassNameForAggregation(isInline: boolean, isLast: boolean) {
  return className({
    'md-pb3': isInline,
    mb4: !isInline && !isLast,
    mb3: !isInline && isLast,
  });
}

const AggregationFilters = ({
  aggregations,
  numberOfResults,
  query,
  onAggregationChange,
  inline,
  displayWhenNoResults,
  initialAggregations,
  embedded,
  page,
  state,
}: {
  aggregations: Map<string, any>;
  numberOfResults: number;
  query: string;
  onAggregationChange: Function;
  inline: boolean;
  displayWhenNoResults: boolean;
  initialAggregations: Map<string, any>;
  embedded: boolean;
  page: number;
  state: any;
}) => {
  function compareAggregationEntries(
    [, aggregation1]: Map<string, any>[],
    [, aggregation2]: Map<string, any>[]
  ) {
    const order1 = aggregation1.getIn(['meta', 'order']);
    const order2 = aggregation2.getIn(['meta', 'order']);
    return (order1 as number) - (order2 as number);
  }
  const rowClassName = className('bg-white', {
    ph3: !inline,
    pt3: !inline && !embedded,
    pv3: inline,
  });
  const aggregationEntries = aggregations && aggregations.entrySeq();
  return (
    aggregationEntries &&
    (numberOfResults > 0 || displayWhenNoResults) && (
      <Row className={rowClassName} justify="space-between">
        {aggregationEntries
          .filter(([, aggregation]) => aggregation.get('buckets').size > 0)
          .sort(compareAggregationEntries)
          .map(([aggregationKey, aggregation], index) => (
            <Col
              className={getClassNameForAggregation(
                inline,
                index === (aggregationEntries.size || 0) - 1
              )}
              key={aggregationKey}
              xs={24}
              lg={inline ? 5 : 24}
            >
              <EventTracker
                eventId={aggregation.getIn(['meta', 'title'])}
                eventCategory={page}
                eventAction="Facet"
                eventPropName="onChange"
              >
                <AggregationFilter
                  aggregationType={aggregation.getIn(['meta', 'type'])}
                  name={aggregation.getIn(['meta', 'title'])}
                  buckets={aggregation.get('buckets')}
                  initialBuckets={initialAggregations.getIn([
                    aggregationKey,
                    'buckets',
                  ])}
                  // TODO: pass `{...agg.get('meta')}` instead of passing them separately
                  splitDisplayName={aggregation.getIn(['meta', 'split'])}
                  bucketHelp={aggregation.getIn(['meta', 'bucket_help'])}
                  selections={query[aggregationKey as unknown as number]}
                  onChange={(selections: any) => {
                    onAggregationChange(aggregationKey, selections);
                  }}
                  splitTreeBy={aggregation.getIn(['meta', 'split_tree_by'])}
                />
              </EventTracker>
            </Col>
          ))}
      </Row>
    )
  );
};

AggregationFilters.defaultProps = {
  inline: false,
  displayWhenNoResults: false,
  embedded: false,
};

export default AggregationFilters;
