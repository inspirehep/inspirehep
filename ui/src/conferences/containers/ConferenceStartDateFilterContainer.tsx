// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import { searchQueryUpdate } from '../../actions/search';
import EventStartDateFilter from '../../common/components/EventStartDateFilter';
import { CONFERENCES_NS } from '../../search/constants';
import {
  START_DATE_UPCOMING,
  START_DATE_ALL,
  START_DATE,
  DATE_ASC,
  DATE_DESC,
} from '../../common/constants';

const stateToProps = (state: any) => ({
  selection: state.search.getIn([
    'namespaces',
    CONFERENCES_NS,
    'query',
    START_DATE,
  ])
});

export const dispatchToProps = (dispatch: any) => ({
  onChange(selection: any) {
    const query = { [START_DATE]: selection, page: '1' };

    if (selection === START_DATE_UPCOMING) {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'sort' does not exist on type '{ start_da... Remove this comment to see the full error message
      query.sort = DATE_ASC;
    } else if (selection === START_DATE_ALL) {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'sort' does not exist on type '{ start_da... Remove this comment to see the full error message
      query.sort = DATE_DESC;
    }

    dispatch(searchQueryUpdate(CONFERENCES_NS, query));
  }
});

export default connect(stateToProps, dispatchToProps)(EventStartDateFilter);
