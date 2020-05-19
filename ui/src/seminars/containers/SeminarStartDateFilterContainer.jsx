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

const stateToProps = state => ({
  selection: state.search.getIn([
    'namespaces',
    SEMINARS_NS,
    'query',
    START_DATE,
  ]),
});

export const dispatchToProps = dispatch => ({
  onChange(selection) {
    const query = { [START_DATE]: selection, page: '1' };

    if (selection === START_DATE_UPCOMING) {
      query.sort = DATE_ASC;
      query.timezone = undefined;
    } else if (selection === START_DATE_ALL) {
      query.sort = DATE_DESC;
      query.timezone = undefined;
    } else {
      query.timezone = LOCAL_TIMEZONE;
    }

    dispatch(searchQueryUpdate(SEMINARS_NS, query));
  },
});

export default connect(stateToProps, dispatchToProps)(EventStartDateFilter);
