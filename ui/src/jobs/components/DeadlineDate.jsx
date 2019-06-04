import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import IconText from '../../common/components/IconText';

class DeadlineDate extends Component {
  render() {
    const { deadlineDate } = this.props;
    const formattedDeadlineDate = moment(deadlineDate).format('MMM D, YYYY');
    return (
      <strong>
        <IconText
          type="clock-circle"
          text={`Deadline on ${formattedDeadlineDate}`}
        />
      </strong>
    );
  }
}

DeadlineDate.propTypes = {
  deadlineDate: PropTypes.string.isRequired,
};
export default DeadlineDate;
