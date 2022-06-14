import React, { Component } from 'react';
import { Col, Row } from 'antd';
import ExceptionsTable from './ExceptionsTable';
import InlineList from '../../common/components/InlineList';

import UnclickableTag from '../../common/components/UnclickableTag';
import './ExceptionsDashboard.scss';

type Props = {
    exceptions: {
        collection?: string;
        error?: string;
        recid?: number;
    }[];
    loading: boolean;
};

type State = $TSFixMe;

class ExceptionsDashboard extends Component<Props, State> {

  static getDerivedStateFromProps(nextProps: $TSFixMe, prevState: $TSFixMe) {
    const { exceptions } = nextProps;
    const { prevExceptions } = prevState;

    if (exceptions === prevExceptions) {
      return prevState;
    }

    const countEntriesByCollection = ExceptionsDashboard.getExceptionCountEntriesByCollection(
      exceptions
    );
    return {
      ...prevState,
      prevExceptions: exceptions,
      countEntriesByCollection,
    };
  }

  static getExceptionCountEntriesByCollection(exceptions: $TSFixMe) {
    const countMap = exceptions.reduce((counts: $TSFixMe, exception: $TSFixMe) => {
      if (counts[exception.collection] === undefined) {
        counts[exception.collection] = 0;
      }
      counts[exception.collection] += 1;
      return counts;
    }, {});
    return Object.entries(countMap);
  }

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const { countEntriesByCollection } = this.state;
    const { loading, exceptions } = this.props;

    return (
      <div className="__ExceptionsDashboard__">
        <div className="collection-counts">
          <InlineList
            separateItems={false}
            items={countEntriesByCollection}
            label="Collections"
            // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'collectionName' implicitly has an... Remove this comment to see the full error message
            renderItem={([collectionName, collectionCount]) => (
              // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
              <UnclickableTag className="space-around">
                {collectionCount} {collectionName}
              </UnclickableTag>
            )}
          />
        </div>
        {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
        <Row type="flex" justify="space-around">
          <Col span={20}>
            <ExceptionsTable exceptions={exceptions} loading={loading} />
          </Col>
        </Row>
      </div>
    );
  }
}

export default ExceptionsDashboard;
