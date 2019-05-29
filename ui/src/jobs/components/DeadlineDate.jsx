import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IconText from '../../common/components/IconText';

class DeadlineDate extends Component {
  render() {
    const { deadlineDate } = this.props;
    return (
      <IconText type="clock-circle" text={`Deadline on ${deadlineDate}`} />
    );
  }
}

DeadlineDate.propTypes = {
  deadlineDate: PropTypes.string.isRequired,
};
export default DeadlineDate;
