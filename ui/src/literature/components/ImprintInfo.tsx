import React, { Component } from 'react';
import { List } from 'immutable';
import moment from 'moment';
import { hasDayMonthAndYear, hasMonthAndYear } from '../../common/utils';

import InlineList, { SEPARATOR_AND } from '../../common/components/InlineList';

function formatDate(date: $TSFixMe) {
  if (hasDayMonthAndYear(date)) {
    return ' MMM D, YYYY';
  }

  if (hasMonthAndYear(date)) {
    return ' MMM, YYYY';
  }

  return ' YYYY';
}

type OwnProps = {
    imprint?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type Props = OwnProps & typeof ImprintInfo.defaultProps;

class ImprintInfo extends Component<Props> {

static defaultProps = {
    imprint: null,
};

  static renderImprint(imprint: $TSFixMe) {
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

  static extractKeyFromIsbn(imprint: $TSFixMe) {
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

export default ImprintInfo;
