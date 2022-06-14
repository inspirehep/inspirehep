import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'antd';
import ExceptionsTable from './ExceptionsTable';
import InlineList from '../../common/components/InlineList';

import UnclickableTag from '../../common/components/UnclickableTag';
import './ExceptionsDashboard.scss';

class ExceptionsDashboard extends Component {
  static getDerivedStateFromProps(nextProps: any, prevState: any) {
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

  static getExceptionCountEntriesByCollection(exceptions: any) {
    const countMap = exceptions.reduce((counts: any, exception: any) => {
      if (counts[exception.collection] === undefined) {
        counts[exception.collection] = 0;
      }
      counts[exception.collection] += 1;
      return counts;
    }, {});
    return Object.entries(countMap);
  }

  constructor(props: any) {
    super(props);
    this.state = {};
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'countEntriesByCollection' does not exist... Remove this comment to see the full error message
    const { countEntriesByCollection } = this.state;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'loading' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { loading, exceptions } = this.props;

    const exceptionsTableProps = {
      exceptions,
      loading
    }

    return (
      <div className="__ExceptionsDashboard__">
        <div className="collection-counts">
          <InlineList
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
        <Row justify="space-around">
          <Col span={20}>
            <ExceptionsTable {...exceptionsTableProps} />
          </Col>
        </Row>
      </div>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ExceptionsDashboard.propTypes = {
  exceptions: PropTypes.arrayOf(
    PropTypes.shape({
      collection: PropTypes.string,
      error: PropTypes.string,
      recid: PropTypes.number,
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default ExceptionsDashboard;
