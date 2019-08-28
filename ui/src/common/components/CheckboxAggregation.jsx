import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { Col, Row } from 'antd';

import UnclickableTag from './UnclickableTag';
import CheckboxItem from './CheckboxItem';
import AggregationBox from './AggregationBox';
import SecondaryButton from './SecondaryButton';
import { forceArray } from '../utils';

const BUCKET_CHUNK_SIZE = 10;
export const BUCKET_NAME_SPLITTER = '_';

class CheckboxAggregation extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const { selections } = nextProps;
    const { prevSelections } = prevState;

    if (selections === prevSelections) {
      return prevState;
    }

    let selectionMap;
    if (selections) {
      const selectionsAsArray = forceArray(selections);
      selectionMap = selectionsAsArray.reduce(
        (map, key) => map.set(key, true),
        Immutable.Map()
      );
    } else {
      selectionMap = Immutable.Map();
    }

    return {
      ...prevState,
      prevSelections: selections,
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
    this.renderBucket = this.renderBucket.bind(this);
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

  renderBucket(bucket) {
    const { selectionMap } = this.state;
    const { splitDisplayName } = this.props;

    const bucketKey = bucket.get('key');
    return (
      <Row className="mb2" type="flex" justify="space-between" key={bucketKey}>
        <Col>
          <CheckboxItem
            checked={selectionMap.get(bucketKey)}
            onChange={checked => {
              this.onSelectionChange(bucketKey, checked);
            }}
          >
            {splitDisplayName
              ? bucketKey.split(BUCKET_NAME_SPLITTER)[1]
              : bucketKey}
          </CheckboxItem>
        </Col>
        <Col>
          <UnclickableTag>{bucket.get('doc_count')}</UnclickableTag>
        </Col>
      </Row>
    );
  }

  render() {
    const { maxBucketCountToDisplay } = this.state;
    const { name, buckets } = this.props;
    return (
      <AggregationBox name={name}>
        {buckets.take(maxBucketCountToDisplay).map(this.renderBucket)}
        {this.renderShowMore()}
      </AggregationBox>
    );
  }
}

CheckboxAggregation.propTypes = {
  onChange: PropTypes.func.isRequired,
  buckets: PropTypes.instanceOf(Immutable.List).isRequired,
  name: PropTypes.string.isRequired,
  splitDisplayName: PropTypes.bool,
  selections: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
};

CheckboxAggregation.defaultProps = {
  selections: null,
  splitDisplayName: false,
};

export default CheckboxAggregation;
