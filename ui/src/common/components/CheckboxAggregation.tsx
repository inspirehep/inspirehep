import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { Col, Row, Checkbox } from 'antd';

import UnclickableTag from './UnclickableTag';
import AggregationBox from './AggregationBox';
import SecondaryButton from './SecondaryButton';
import { forceArray } from '../utils';
import HelpIconTooltip from './HelpIconTooltip';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from './ExternalLink.tsx';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import FormattedNumber from './FormattedNumber.tsx';

const BUCKET_CHUNK_SIZE = 10;
export const BUCKET_NAME_SPLITTER = '_';

class CheckboxAggregation extends Component {
  static getDerivedStateFromProps(nextProps: any, prevState: any) {
    const { selections } = nextProps;
    const { prevSelections } = prevState;

    if (selections === prevSelections) {
      return prevState;
    }

    let selectionMap;
    if (selections) {
      const selectionsAsArray = forceArray(selections);
      selectionMap = selectionsAsArray.reduce(
        (map: any, key: any) => map.set(key, true),
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

  constructor(props: any) {
    super(props);
    this.state = {
      selectionMap: Immutable.Map(),
      maxBucketCountToDisplay: BUCKET_CHUNK_SIZE,
    };

    this.onShowMoreClick = this.onShowMoreClick.bind(this);
    this.renderBucket = this.renderBucket.bind(this);
  }

  onSelectionChange(key: any, selected: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'selectionMap' does not exist on type 'Re... Remove this comment to see the full error message
    let { selectionMap } = this.state;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onChange' does not exist on type 'Readon... Remove this comment to see the full error message
    const { onChange } = this.props;
    selectionMap = selectionMap.set(key, selected);
    this.setState({ selectionMap });
    const selections = selectionMap
      .keySeq()
      .filter((bucketKey: any) => selectionMap.get(bucketKey))
      .toArray();
    onChange(selections);
  }

  onShowMoreClick() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'maxBucketCountToDisplay' does not exist ... Remove this comment to see the full error message
    const { maxBucketCountToDisplay } = this.state;
    this.setState({
      maxBucketCountToDisplay: maxBucketCountToDisplay + BUCKET_CHUNK_SIZE,
    });
  }

  static renderBucketHelpTooltip(bucketHelpKey: any) {
    if (!bucketHelpKey) {
      return null;
    }

    const bucketText = bucketHelpKey.get('text');
    const bucketLink = bucketHelpKey.get('link');

    return (
      <>
        {' '}
        <HelpIconTooltip
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          help={
            <>
              {bucketText}{' '}
              {bucketLink && (
                <ExternalLink href={bucketLink}>Learn More</ExternalLink>
              )}
            </>
          }
        />
      </>
    );
  }

  renderShowMore() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'buckets' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { buckets } = this.props;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'maxBucketCountToDisplay' does not exist ... Remove this comment to see the full error message
    const { maxBucketCountToDisplay } = this.state;

    if (maxBucketCountToDisplay >= buckets.size) {
      return null;
    }

    const hiddenBucketCount = buckets.size - maxBucketCountToDisplay;

    return (
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <SecondaryButton onClick={this.onShowMoreClick}>
        Show {hiddenBucketCount} more
      </SecondaryButton>
    );
  }

  renderBucket(bucket: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'selectionMap' does not exist on type 'Re... Remove this comment to see the full error message
    const { selectionMap } = this.state;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'splitDisplayName' does not exist on type... Remove this comment to see the full error message
    const { splitDisplayName, bucketHelp } = this.props;
    const bucketKey = bucket.get('key');
    const bucketDisplay = splitDisplayName
      ? bucketKey.split(BUCKET_NAME_SPLITTER)[1]
      : bucketKey;

    return (
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Row className="mb2" type="flex" justify="space-between" key={bucketKey}>
        <Col>
          <Checkbox
            checked={selectionMap.get(bucketKey)}
            onChange={event => {
              this.onSelectionChange(bucketKey, event.target.checked);
            }}
          >
            <span data-test-id={`checkbox-aggregation-option-${bucketDisplay}`}>
              {bucketDisplay}
              {bucketHelp &&
                CheckboxAggregation.renderBucketHelpTooltip(
                  bucketHelp.get(bucketKey)
                )}
            </span>
          </Checkbox>
        </Col>
        <Col>
          <UnclickableTag>
            <FormattedNumber>{bucket.get('doc_count')}</FormattedNumber>
          </UnclickableTag>
        </Col>
      </Row>
    );
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'maxBucketCountToDisplay' does not exist ... Remove this comment to see the full error message
    const { maxBucketCountToDisplay } = this.state;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { name, buckets } = this.props;
    return (
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <AggregationBox name={name}>
        {buckets.take(maxBucketCountToDisplay).map(this.renderBucket)}
        {this.renderShowMore()}
      </AggregationBox>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
CheckboxAggregation.propTypes = {
  onChange: PropTypes.func.isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  buckets: PropTypes.instanceOf(Immutable.List).isRequired,
  name: PropTypes.string.isRequired,
  splitDisplayName: PropTypes.bool,
  bucketHelp: PropTypes.object,
  selections: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
CheckboxAggregation.defaultProps = {
  selections: null,
  splitDisplayName: false,
};

export default CheckboxAggregation;
