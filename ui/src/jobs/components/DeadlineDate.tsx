import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ClockCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

import IconText from '../../common/components/IconText';

class DeadlineDate extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'deadlineDate' does not exist on type 'Re... Remove this comment to see the full error message
    const { deadlineDate } = this.props;
    const formattedDeadlineDate = moment(deadlineDate).format('MMM D, YYYY');
    return (
      <strong>
        <IconText
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          icon={<ClockCircleOutlined />}
          text={`Deadline on ${formattedDeadlineDate}`}
        />
      </strong>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
DeadlineDate.propTypes = {
  deadlineDate: PropTypes.string.isRequired,
};
export default DeadlineDate;
