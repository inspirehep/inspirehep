import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Tag } from 'antd';
import ExceptionsTable from '../components/ExceptionsTable';
import InlineList from '../../common/components/InlineList';
import './ExceptionsDashboard.scss';

class ExceptionsDashboard extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const { exceptions } = nextProps;
    const countEntriesByCollection = ExceptionsDashboard.getExceptionCountEntriesByCollection(
      exceptions
    );
    return {
      ...prevState,
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
    return (
      <div className="__ExceptionsDashboard__">
        <div className="collection-counts">
          <InlineList
            separateItems={false}
            items={this.state.countEntriesByCollection}
            renderItem={([collectionName, collectionCount]) => (
              <span className="space-around">
                {collectionName} <Tag>{collectionCount}</Tag>
              </span>
            )}
          />
        </div>

        <Row type="flex" justify="space-around">
          <Col>
            <ExceptionsTable exceptions={this.props.exceptions} />
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
};

export default ExceptionsDashboard;
