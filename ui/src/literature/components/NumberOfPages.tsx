import React, { Component } from 'react';
import PropTypes from 'prop-types';
import pluralizeUnlessSingle from '../../common/utils';

class NumberOfPages extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'numberOfPages' does not exist on type 'R... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
NumberOfPages.propTypes = {
  numberOfPages: PropTypes.number,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
NumberOfPages.defaultProps = {
  numberOfPages: null,
};

export default NumberOfPages;
