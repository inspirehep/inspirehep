import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

class DateFromNow extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'date' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { date } = this.props;
    return <span>{moment(date).fromNow()}</span>;
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
DateFromNow.propTypes = {
  date: PropTypes.string.isRequired,
};

export default DateFromNow;
