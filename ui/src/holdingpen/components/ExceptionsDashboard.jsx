import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import EntryList from '../../common/components/EntryList';
import ExceptionsTable from '../components/ExceptionsTable';

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
      <div>
        <h1>Exceptions Dashboard</h1>

        <Row type="flex" justify="space-around" align="middle">
          <Col>
            <EntryList
              title="Collections"
              entries={this.state.countEntriesByCollection}
            />
          </Col>
        </Row>

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
