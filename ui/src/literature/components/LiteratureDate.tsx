import React, { Component } from 'react';
import PropTypes from 'prop-types';

class LiteratureDate extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'date' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { date } = this.props;
    return <span>{date}</span>;
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
LiteratureDate.propTypes = {
  date: PropTypes.string,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
LiteratureDate.defaultProps = {
  date: null,
};

export default LiteratureDate;
