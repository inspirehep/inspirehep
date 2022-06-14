import React, { Component } from 'react';
import Immutable from 'immutable';
import { Row, Col } from 'antd';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import className from 'classnames';

import AggregationFilter from './AggregationFilter';
import EventTracker from './EventTracker';

function getClassNameForAggregation(isInline: $TSFixMe, isLast: $TSFixMe) {
  return className({
    'md-pb3': isInline,
    mb4: !isInline && !isLast,
    mb3: !isInline && isLast,
  });
}

type OwnProps = {
    inline?: boolean;
    onAggregationChange: $TSFixMeFunction;
    aggregations: $TSFixMe; // TODO: PropTypes.instanceOf(Immutable.Map)
    initialAggregations: $TSFixMe; // TODO: PropTypes.instanceOf(Immutable.Map)
    query: {
        [key: string]: $TSFixMe;
    };
    numberOfResults: number;
    displayWhenNoResults?: boolean;
    embedded?: boolean;
};

type Props = OwnProps & typeof AggregationFilters.defaultProps;

class AggregationFilters extends Component<Props> {

static defaultProps = {
    inline: false,
    displayWhenNoResults: false,
    embedded: false,
};

  // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'aggregation1' implicitly has an '... Remove this comment to see the full error message
  static compareAggregationEntries([, aggregation1], [, aggregation2]) {
    const order1 = aggregation1.getIn(['meta', 'order']);
    const order2 = aggregation2.getIn(['meta', 'order']);
    return order1 - order2;
  }

  render() {
    const {
      aggregations,
      numberOfResults,
      query,
      onAggregationChange,
      inline,
      displayWhenNoResults,
      initialAggregations,
      embedded,
    } = this.props;
    const rowClassName = className('bg-white', {
      ph3: !inline,
      pt3: !inline && !embedded,
      pv3: inline,
    });
    const aggregationEntries = aggregations && aggregations.entrySeq();
    return aggregationEntries &&
    (numberOfResults > 0 || displayWhenNoResults) && (
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Row className={rowClassName} type="flex" justify="space-between">
        {aggregationEntries
          // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'aggregation' implicitly has an 'a... Remove this comment to see the full error message
          .filter(([, aggregation]) => aggregation.get('buckets').size > 0)
          .sort(AggregationFilters.compareAggregationEntries)
          // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'aggregationKey' implicitly has an... Remove this comment to see the full error message
          .map(([aggregationKey, aggregation], index: $TSFixMe) => (
            <Col
              className={getClassNameForAggregation(
                inline,
                index === aggregationEntries.size - 1
              )}
              key={aggregationKey}
              xs={24}
              lg={inline ? 5 : 24}
            >
              {/* @ts-expect-error ts-migrate(2745) FIXME: This JSX tag's 'children' prop expects type 'never... Remove this comment to see the full error message */}
              <EventTracker
                // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
                eventId={`Facet-${aggregation.getIn(['meta', 'title'])}`}
                // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
                eventPropName="onChange"
              >
                <AggregationFilter
                  aggregationType={aggregation.getIn(['meta', 'type'])}
                  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                  name={aggregation.getIn(['meta', 'title'])}
                  buckets={aggregation.get('buckets')}
                  initialBuckets={initialAggregations.getIn([
                    aggregationKey,
                    'buckets',
                  ])}
                  // TODO: pass `{...agg.get('meta')}` instead of passing them separately
                  splitDisplayName={aggregation.getIn(['meta', 'split'])}
                  bucketHelp={aggregation.getIn(['meta', 'bucket_help'])}
                  selections={query[aggregationKey]}
                  onChange={(selections: $TSFixMe) => {
                    onAggregationChange(aggregationKey, selections);
                  }}
                  splitTreeBy={aggregation.getIn(['meta', 'split_tree_by'])}
                />
              </EventTracker>
            </Col>
          ))}
      </Row>
    );
  }
}

export default AggregationFilters;
