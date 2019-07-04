import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

class LiteratureDate extends Component {
  render() {
    const { date } = this.props;
    const formattedDate = moment(date).format('MMM DD, YYYY');
    return <span>{formattedDate}</span>;
  }
}

LiteratureDate.propTypes = {
  date: PropTypes.string,
};

LiteratureDate.defaultProps = {
  date: null,
};

export default LiteratureDate;
