import React, { Component } from 'react';
import moment from 'moment';

type Props = {
    date: string;
};

class DateFromNow extends Component<Props> {

  render() {
    const { date } = this.props;
    return <span>{moment(date).fromNow()}</span>;
  }
}

export default DateFromNow;
