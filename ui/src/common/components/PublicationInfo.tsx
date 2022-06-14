import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { getPageDisplay } from '../../literature/utils';
import JournalInfo from './JournalInfo';

class PublicationInfo extends Component {
  getPageOrArtidDisplay() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'info' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { info } = this.props;

    if (getPageDisplay(info)) {
      return getPageDisplay(info);
    }

    if (info.has('artid')) {
      return info.get('artid');
    }
    return null;
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'info' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { info } = this.props;
    const material = info.get('material');
    const journalIssue = info.get('journal_issue');
    const pageOrArtidDisplay = this.getPageOrArtidDisplay();
    if (info.has('journal_title')) {
      return (
        <span>
          <JournalInfo info={info} />
          {pageOrArtidDisplay && journalIssue && <span>,</span>}
          {pageOrArtidDisplay && <span> {pageOrArtidDisplay}</span>}
          {material && material !== 'publication' && <span> ({material})</span>}
        </span>
      );
    }

    if (info.has('pubinfo_freetext')) {
      return <span>{info.get('pubinfo_freetext')}</span>;
    }

    return null;
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
PublicationInfo.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  info: PropTypes.instanceOf(Map).isRequired,
};

export default PublicationInfo;
