import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { Col, Row, Tag } from 'antd';

import CheckboxItem from './CheckboxItem';
import AggregationBox from './AggregationBox';

const BUCKET_CHUNK_SIZE = 10;

class CheckboxAggregation extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    let selectionMap;
    if (nextProps.selections) {
      selectionMap = nextProps.selections.reduce(
        (map, key) => map.set(key, true),
        Immutable.Map()
      );
    } else {
      selectionMap = Immutable.Map();
    }

    return {
      ...prevState,
      selectionMap,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      selectionMap: Immutable.Map(),
      maxBucketCountToDisplay: BUCKET_CHUNK_SIZE,
    };

    this.onShowMoreClick = this.onShowMoreClick.bind(this);
  }

  onSelectionChange(key, selected) {
    let { selectionMap } = this.state;
    selectionMap = selectionMap.set(key, selected);
    this.setState({ selectionMap });
    const selections = selectionMap
      .keySeq()
      .filter(bucketKey => selectionMap.get(bucketKey))
      .toArray();
    this.props.onChange(selections);
  }

  onShowMoreClick() {
    const { maxBucketCountToDisplay } = this.state;
    this.setState({
      maxBucketCountToDisplay: maxBucketCountToDisplay + BUCKET_CHUNK_SIZE,
    });
  }

  renderShowMore() {
    const { buckets } = this.props;
    const { maxBucketCountToDisplay } = this.state;

    if (maxBucketCountToDisplay >= buckets.size) {
      return null;
    }

    /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */
    return <a onClick={this.onShowMoreClick}>Show more</a>;
  }

  render() {
    const { maxBucketCountToDisplay, selectionMap } = this.state;
    return (
      <AggregationBox name={this.props.name}>
        {this.props.buckets.take(maxBucketCountToDisplay).map(bucket => (
          <Row
            className="mb2"
            type="flex"
            justify="space-between"
            key={bucket.get('key')}
          >
            <Col>
              <CheckboxItem
                checked={selectionMap.get(bucket.get('key'))}
                onChange={checked => {
                  this.onSelectionChange(bucket.get('key'), checked);
                }}
              >
                {bucket.get('key')}
              </CheckboxItem>
            </Col>
            <Col>
              <Tag>{bucket.get('doc_count')}</Tag>
            </Col>
          </Row>
        ))}
        {this.renderShowMore()}
      </AggregationBox>
    );
  }
}

CheckboxAggregation.propTypes = {
  onChange: PropTypes.func.isRequired,
  buckets: PropTypes.instanceOf(Immutable.List).isRequired,
  name: PropTypes.string.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  selections: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default CheckboxAggregation;
