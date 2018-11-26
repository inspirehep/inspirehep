import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { Col, Row, Tag } from 'antd';

import CheckboxItem from './CheckboxItem';
import AggregationBox from './AggregationBox';
import SecondaryButton from './SecondaryButton';
import { forceArray } from '../utils';

const BUCKET_CHUNK_SIZE = 10;

class CheckboxAggregation extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    let selectionMap;
    if (nextProps.selections) {
      const selectionsAsArray = forceArray(nextProps.selections);
      selectionMap = selectionsAsArray.reduce(
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
    const { onChange } = this.props;
    selectionMap = selectionMap.set(key, selected);
    this.setState({ selectionMap });
    const selections = selectionMap
      .keySeq()
      .filter(bucketKey => selectionMap.get(bucketKey))
      .toArray();
    onChange(selections);
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

    const hiddenBucketCount = buckets.size - maxBucketCountToDisplay;

    return (
      <SecondaryButton onClick={this.onShowMoreClick}>
        Show {hiddenBucketCount} more
      </SecondaryButton>
    );
  }

  render() {
    const { maxBucketCountToDisplay, selectionMap } = this.state;
    const { buckets, name } = this.props;
    return (
      <AggregationBox name={name}>
        {buckets.take(maxBucketCountToDisplay).map(bucket => (
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
  selections: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
};

CheckboxAggregation.defaultProps = {
  selections: null,
};

export default CheckboxAggregation;
