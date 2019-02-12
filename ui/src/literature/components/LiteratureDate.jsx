import React, { Component } from 'react';
import PropTypes from 'prop-types';

class LiteratureDate extends Component {
  render() {
    const { date } = this.props;

    return (
      <span>{date}</span>
    );
  }
}

LiteratureDate.propTypes = {
  date: PropTypes.string,
};

LiteratureDate.defaultProps = {
  date: null,
};


export default LiteratureDate;
