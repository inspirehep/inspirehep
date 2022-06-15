import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

function DateFromNow(props : any){
    const { date } = props;
    return <span>{moment(date).fromNow()}</span>;

}

DateFromNow.propTypes = {
  date: PropTypes.string.isRequired,
};

export default DateFromNow;
