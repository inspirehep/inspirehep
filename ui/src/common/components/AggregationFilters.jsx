import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { Row, Col } from 'antd';

import AggregationFilter from './AggregationFilter';
import EventTracker from './EventTracker';

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
    } = this.props;
    return (
      aggregations &&
      numberOfResults > 0 && (
        <Row className="bg-white pa3" type="flex" justify="space-between">
          {aggregations
            .entrySeq()
            .filter(([, aggregation]) => aggregation.get('buckets').size > 0)
            .sort(AggregationFilters.compareAggregationEntries)
            .map(([aggregationKey, aggregation]) => (
              <Col
                key={aggregationKey}
                xs={24}
                lg={inline ? 5 : 24}
                gutter={32}
              >
                <EventTracker
                  eventId={`Facet-${aggregation.getIn(['meta', 'title'])}`}
                  eventPropName="onChange"
                >
                  <AggregationFilter
                    aggregationType={aggregation.getIn(['meta', 'type'])}
                    name={aggregation.getIn(['meta', 'title'])}
                    buckets={aggregation.get('buckets')}
                    splitDisplayName={aggregation.getIn(['meta', 'split'])}
                    selections={query[aggregationKey]}
                    onChange={selections => {
                      onAggregationChange(aggregationKey, selections);
                    }}
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
  query: PropTypes.objectOf(PropTypes.any).isRequired,
  numberOfResults: PropTypes.number.isRequired,
};

AggregationFilters.defaultProps = {
  inline: false,
};

export default AggregationFilters;
