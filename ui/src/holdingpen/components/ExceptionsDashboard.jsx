import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import CategoryCard from '../components/CategoryCard';
import ExceptionsTable from '../components/ExceptionsTable';

class ExceptionsDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exceptions: props.exceptions,
      collections: this.getExceptionsCountByCollection(),
    };
  }

  getExceptionsCountByCollection() {
    return this.props.exceptions.reduce((tally, exception) => {
      if (tally[exception.collection] === undefined) {
        tally[exception.collection] = 0;
      }
      tally[exception.collection] += 1;
      return tally;
    }, {});
  }

  render() {
    return (
      <div>
        <h1>Exceptions Dashboard</h1>

        <Row type="flex" justify="space-around" align="middle">
          <Col>
            <CategoryCard
              title="Collections"
              categoryCount={this.state.collections}
            />
          </Col>
        </Row>

        <Row type="flex" justify="space-around">
          <Col>
            <ExceptionsTable exceptions={this.state.exceptions} />
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
