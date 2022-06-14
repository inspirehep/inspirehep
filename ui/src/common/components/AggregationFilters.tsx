import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { Row, Col } from 'antd';
import className from 'classnames';

import AggregationFilter from './AggregationFilter';
import EventTracker from './EventTracker';

function getClassNameForAggregation(isInline, isLast) {
  return className({
    'md-pb3': isInline,
    mb4: !isInline && !isLast,
    mb3: !isInline && isLast,
  });
}

class AggregationFilters extends Component {
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
    return (
      aggregationEntries &&
      (numberOfResults > 0 || displayWhenNoResults) && (
        <Row className={rowClassName} type="flex" justify="space-between">
          {aggregationEntries
            .filter(([, aggregation]) => aggregation.get('buckets').size > 0)
            .sort(AggregationFilters.compareAggregationEntries)
            .map(([aggregationKey, aggregation], index) => (
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
                  eventId={`Facet-${aggregation.getIn(['meta', 'title'])}`}
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
                    selections={query[aggregationKey]}
                    onChange={selections => {
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
  }
}

AggregationFilters.propTypes = {
  inline: PropTypes.bool,
  onAggregationChange: PropTypes.func.isRequired,
  aggregations: PropTypes.instanceOf(Immutable.Map).isRequired,
  initialAggregations: PropTypes.instanceOf(Immutable.Map).isRequired,
  query: PropTypes.objectOf(PropTypes.any).isRequired,
  numberOfResults: PropTypes.number.isRequired,
  displayWhenNoResults: PropTypes.bool,
  embedded: PropTypes.bool,
};

AggregationFilters.defaultProps = {
  inline: false,
  displayWhenNoResults: false,
  embedded: false,
};

export default AggregationFilters;
