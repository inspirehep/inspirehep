import React, { Component } from 'react';
import { ClockCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

import IconText from '../../common/components/IconText';

type Props = {
    deadlineDate: string;
};

class DeadlineDate extends Component<Props> {

  render() {
    const { deadlineDate } = this.props;
    const formattedDeadlineDate = moment(deadlineDate).format('MMM D, YYYY');
    return (
      <strong>
        <IconText
          icon={<ClockCircleOutlined />}
          text={`Deadline on ${formattedDeadlineDate}`}
        />
      </strong>
    );
  }
}
export default DeadlineDate;
