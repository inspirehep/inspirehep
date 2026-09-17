import { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

class DateFromNow extends Component {
  render() {
    const { date } = this.props;
    return <span>{dayjs(date).fromNow()}</span>;
  }
}

DateFromNow.propTypes = {
  date: PropTypes.string.isRequired,
};

export default DateFromNow;
