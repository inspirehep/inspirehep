import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import moment from 'moment';
import { hasDayMonthAndYear, hasMonthAndYear } from '../../common/utils';

import InlineList, { SEPARATOR_AND } from '../../common/components/InlineList';

function formatDate(date) {
  if (hasDayMonthAndYear(date)) {
    return ' MMM D, YYYY';
  }

  if (hasMonthAndYear(date)) {
    return ' MMM, YYYY';
  }

  return ' YYYY';
}

class ImprintInfo extends Component {
  static renderImprint(imprint) {
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

  static extractKeyFromIsbn(imprint) {
    return imprint.get('value');
  }

  render() {
    const { imprint } = this.props;
    return (
      <InlineList
        separator={SEPARATOR_AND}
        items={imprint}
        extractKey={ImprintInfo.extractKeyFromIsbn}
        renderItem={ImprintInfo.renderImprint}
      />
    );
  }
}

ImprintInfo.propTypes = {
  imprint: PropTypes.instanceOf(List),
};

ImprintInfo.defaultProps = {
  imprint: null,
};

export default ImprintInfo;
