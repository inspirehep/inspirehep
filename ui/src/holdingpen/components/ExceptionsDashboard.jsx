import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Row, Tag } from 'antd';
import ExceptionsTable from './ExceptionsTable';
import InlineList from '../../common/components/InlineList';
import './ExceptionsDashboard.scss';

class ExceptionsDashboard extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
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

  static getExceptionCountEntriesByCollection(exceptions) {
    const countMap = exceptions.reduce((counts, exception) => {
      if (counts[exception.collection] === undefined) {
        counts[exception.collection] = 0;
      }
      counts[exception.collection] += 1;
      return counts;
    }, {});
    return Object.entries(countMap);
  }

  constructor(props) {
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
            renderItem={([collectionName, collectionCount]) => (
              <Tag className="space-around">
                {collectionCount} {collectionName}
              </Tag>
            )}
          />
        </div>
        <Row type="flex" justify="space-around">
          <Col span={20}>
            <ExceptionsTable exceptions={exceptions} loading={loading} />
          </Col>
        </Row>
      </div>
    );
  }
}

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
