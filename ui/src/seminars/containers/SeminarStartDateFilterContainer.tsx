// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import { searchQueryUpdate } from '../../actions/search';
import EventStartDateFilter from '../../common/components/EventStartDateFilter';
import { SEMINARS_NS } from '../../search/constants';
import {
  START_DATE_UPCOMING,
  START_DATE_ALL,
  START_DATE,
  DATE_ASC,
  DATE_DESC,
  LOCAL_TIMEZONE,
} from '../../common/constants';

const stateToProps = (state: $TSFixMe) => ({
  selection: state.search.getIn([
    'namespaces',
    SEMINARS_NS,
    'query',
    START_DATE,
  ])
});

export const dispatchToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'dispatch' implicitly has an 'any' type.
  dispatch,
  {
    namespace
  }: $TSFixMe
) => ({
  onChange(selection: $TSFixMe) {
    const query = { [START_DATE]: selection, page: '1' };

    if (selection === START_DATE_UPCOMING) {
      (query as $TSFixMe).sort = DATE_ASC;
      (query as $TSFixMe).timezone = undefined;
    } else if (selection === START_DATE_ALL) {
      (query as $TSFixMe).sort = DATE_DESC;
      (query as $TSFixMe).timezone = undefined;
    } else {
      (query as $TSFixMe).timezone = LOCAL_TIMEZONE;
    }

    dispatch(searchQueryUpdate(namespace, query));
  }
});

export default connect(stateToProps, dispatchToProps)(EventStartDateFilter);
