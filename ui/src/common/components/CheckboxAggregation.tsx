import React, { Component } from 'react';
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

type OwnProps = {
    onChange: $TSFixMeFunction;
    buckets: $TSFixMe; // TODO: PropTypes.instanceOf(Immutable.List)
    name: string;
    splitDisplayName?: boolean;
    bucketHelp?: $TSFixMe;
    selections?: string[] | string;
};

type State = $TSFixMe;

type Props = OwnProps & typeof CheckboxAggregation.defaultProps;

class CheckboxAggregation extends Component<Props, State> {

static defaultProps = {
    selections: null,
    splitDisplayName: false,
};

  static getDerivedStateFromProps(nextProps: $TSFixMe, prevState: $TSFixMe) {
    const { selections } = nextProps;
    const { prevSelections } = prevState;

    if (selections === prevSelections) {
      return prevState;
    }

    let selectionMap;
    if (selections) {
      const selectionsAsArray = forceArray(selections);
      selectionMap = selectionsAsArray.reduce(
        (map: $TSFixMe, key: $TSFixMe) => map.set(key, true),
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

  constructor(props: Props) {
    super(props);
    this.state = {
      selectionMap: Immutable.Map(),
      maxBucketCountToDisplay: BUCKET_CHUNK_SIZE,
    };

    this.onShowMoreClick = this.onShowMoreClick.bind(this);
    this.renderBucket = this.renderBucket.bind(this);
  }

  onSelectionChange(key: $TSFixMe, selected: $TSFixMe) {
    let { selectionMap } = this.state;
    const { onChange } = this.props;
    selectionMap = selectionMap.set(key, selected);
    this.setState({ selectionMap });
    const selections = selectionMap
      .keySeq()
      .filter((bucketKey: $TSFixMe) => selectionMap.get(bucketKey))
      .toArray();
    // @ts-expect-error ts-migrate(2349) FIXME: This expression is not callable.
    onChange(selections);
  }

  onShowMoreClick() {
    const { maxBucketCountToDisplay } = this.state;
    this.setState({
      maxBucketCountToDisplay: maxBucketCountToDisplay + BUCKET_CHUNK_SIZE,
    });
  }

  static renderBucketHelpTooltip(bucketHelpKey: $TSFixMe) {
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
    const { buckets } = this.props;
    const { maxBucketCountToDisplay } = this.state;

    if (maxBucketCountToDisplay >= (buckets as $TSFixMe).size) {
      return null;
    }

    const hiddenBucketCount = (buckets as $TSFixMe).size - maxBucketCountToDisplay;

    return (
      <SecondaryButton onClick={this.onShowMoreClick}>
        Show {hiddenBucketCount} more
      </SecondaryButton>
    );
  }

  renderBucket(bucket: $TSFixMe) {
    const { selectionMap } = this.state;
    const { splitDisplayName, bucketHelp } = this.props;
    const bucketKey = bucket.get('key');
    const bucketDisplay = splitDisplayName
      ? bucketKey.split(BUCKET_NAME_SPLITTER)[1]
      : bucketKey;

    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    return (<Row className="mb2" type="flex" justify="space-between" key={bucketKey}>
        <Col>
          <Checkbox checked={selectionMap.get(bucketKey)} onChange={event => {
        this.onSelectionChange(bucketKey, event.target.checked);
    }}>
            <span data-test-id={`checkbox-aggregation-option-${bucketDisplay}`}>
              {bucketDisplay}
              {bucketHelp &&
        CheckboxAggregation.renderBucketHelpTooltip((bucketHelp as $TSFixMe).get(bucketKey))}
            </span>
          </Checkbox>
        </Col>
        <Col>
          <UnclickableTag>
            <FormattedNumber>{bucket.get('doc_count')}</FormattedNumber>
          </UnclickableTag>
        </Col>
      </Row>);
  }

  render() {
    const { maxBucketCountToDisplay } = this.state;
    const { name, buckets } = this.props;
    // @ts-expect-error ts-migrate(2746) FIXME: This JSX tag's 'children' prop expects a single ch... Remove this comment to see the full error message
    return (<AggregationBox name={name}>
        {(buckets as $TSFixMe).take(maxBucketCountToDisplay).map(this.renderBucket)}
        {this.renderShowMore()}
      </AggregationBox>);
  }
}

export default CheckboxAggregation;
