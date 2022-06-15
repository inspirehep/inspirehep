import React from 'react';
import PropTypes from 'prop-types';
import { ClockCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

import IconText from '../../common/components/IconText';

function DeadlineDate(props: any){
    const { deadlineDate } = props;
    const formattedDeadlineDate = moment(deadlineDate).format('MMM D, YYYY');
    return (
      <strong>
        <IconText
          /* @ts-ignore */
          icon={<ClockCircleOutlined />}
          text={`Deadline on ${formattedDeadlineDate}`}
        />
      </strong>
    );
}

DeadlineDate.propTypes = {
  deadlineDate: PropTypes.string.isRequired,
};
export default DeadlineDate;
