import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

class DateFromNow extends Component {
  render() {
    const { date } = this.props;
    return <span>{moment(date).fromNow()}</span>;
  }
}

DateFromNow.propTypes = {
  date: PropTypes.string.isRequired,
};

export default DateFromNow;
