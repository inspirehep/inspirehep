import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { Row, Col } from 'antd';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'clas... Remove this comment to see the full error message
import className from 'classnames';

import AggregationFilter from './AggregationFilter';
import EventTracker from './EventTracker';

function getClassNameForAggregation(isInline: any, isLast: any) {
  return className({
    'md-pb3': isInline,
    mb4: !isInline && !isLast,
    mb3: !isInline && isLast,
  });
}

class AggregationFilters extends Component {
  // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'aggregation1' implicitly has an '... Remove this comment to see the full error message
  static compareAggregationEntries([, aggregation1], [, aggregation2]) {
    const order1 = aggregation1.getIn(['meta', 'order']);
    const order2 = aggregation2.getIn(['meta', 'order']);
    return order1 - order2;
  }

  render() {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'aggregations' does not exist on type 'Re... Remove this comment to see the full error message
      aggregations,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'numberOfResults' does not exist on type ... Remove this comment to see the full error message
      numberOfResults,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'query' does not exist on type 'Readonly<... Remove this comment to see the full error message
      query,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'onAggregationChange' does not exist on t... Remove this comment to see the full error message
      onAggregationChange,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'inline' does not exist on type 'Readonly... Remove this comment to see the full error message
      inline,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'displayWhenNoResults' does not exist on ... Remove this comment to see the full error message
      displayWhenNoResults,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'initialAggregations' does not exist on t... Remove this comment to see the full error message
      initialAggregations,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'embedded' does not exist on type 'Readon... Remove this comment to see the full error message
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
          .map(([aggregationKey, aggregation], index: any) => (
            <Col
              className={getClassNameForAggregation(
                inline,
                index === aggregationEntries.size - 1
              )}
              key={aggregationKey}
              xs={24}
              lg={inline ? 5 : 24}
            >
              <EventTracker
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; eventId: string; eventP... Remove this comment to see the full error message
                eventId={`Facet-${aggregation.getIn(['meta', 'title'])}`}
                eventPropName="onChange"
              >
                <AggregationFilter
                  // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
                  selections={query[aggregationKey]}
                  onChange={(selections: any) => {
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
AggregationFilters.propTypes = {
  inline: PropTypes.bool,
  onAggregationChange: PropTypes.func.isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  aggregations: PropTypes.instanceOf(Immutable.Map).isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  initialAggregations: PropTypes.instanceOf(Immutable.Map).isRequired,
  query: PropTypes.objectOf(PropTypes.any).isRequired,
  numberOfResults: PropTypes.number.isRequired,
  displayWhenNoResults: PropTypes.bool,
  embedded: PropTypes.bool,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
AggregationFilters.defaultProps = {
  inline: false,
  displayWhenNoResults: false,
  embedded: false,
};

export default AggregationFilters;
