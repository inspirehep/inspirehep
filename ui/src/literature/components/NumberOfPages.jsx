import React, { Component } from 'react';
import PropTypes from 'prop-types';
import pluralizeUnlessSingle from '../../common/utils';

class NumberOfPages extends Component {
  render() {
    const { numberOfPages } = this.props;

    return (
      numberOfPages && (
        <div>
          {numberOfPages} {pluralizeUnlessSingle('page', numberOfPages)}
        </div>
      )
    );
  }
}

NumberOfPages.propTypes = {
  numberOfPages: PropTypes.number,
};

NumberOfPages.defaultProps = {
  numberOfPages: null,
};

export default NumberOfPages;
