import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import moment from 'moment';
import { hasDayMonthAndYear, hasMonthAndYear } from '../../common/utils';

import InlineList, { SEPARATOR_AND } from '../../common/components/InlineList';

function formatDate(date: any) {
  if (hasDayMonthAndYear(date)) {
    return ' MMM D, YYYY';
  }

  if (hasMonthAndYear(date)) {
    return ' MMM, YYYY';
  }

  return ' YYYY';
}

class ImprintInfo extends Component {
  static renderImprint(imprint: any) {
    const date = imprint.get('date');
    const place = imprint.get('place');
    const publisher = imprint.get('publisher');

    const datePart = date ? moment(date).format(formatDate(date)) : '';
    const placePart = place ? ` in ${place} ` : '';
    const publisherPart = publisher ? ` by ${publisher} ` : '';

    return (
      <div>
        <span>
          Published:{datePart}
          {placePart}
          {publisherPart}
        </span>
      </div>
    );
  }

  static extractKeyFromIsbn(imprint: any) {
    return imprint.get('value');
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'imprint' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { imprint } = this.props;
    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        separator={SEPARATOR_AND}
        items={imprint}
        extractKey={ImprintInfo.extractKeyFromIsbn}
        renderItem={ImprintInfo.renderImprint}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
ImprintInfo.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  imprint: PropTypes.instanceOf(List),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
ImprintInfo.defaultProps = {
  imprint: null,
};

export default ImprintInfo;
