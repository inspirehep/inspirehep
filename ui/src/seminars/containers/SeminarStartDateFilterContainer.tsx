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

const stateToProps = (state: any) => ({
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
  }: any
) => ({
  onChange(selection: any) {
    const query = { [START_DATE]: selection, page: '1' };

    if (selection === START_DATE_UPCOMING) {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'sort' does not exist on type '{ start_da... Remove this comment to see the full error message
      query.sort = DATE_ASC;
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'timezone' does not exist on type '{ star... Remove this comment to see the full error message
      query.timezone = undefined;
    } else if (selection === START_DATE_ALL) {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'sort' does not exist on type '{ start_da... Remove this comment to see the full error message
      query.sort = DATE_DESC;
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'timezone' does not exist on type '{ star... Remove this comment to see the full error message
      query.timezone = undefined;
    } else {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'timezone' does not exist on type '{ star... Remove this comment to see the full error message
      query.timezone = LOCAL_TIMEZONE;
    }

    dispatch(searchQueryUpdate(namespace, query));
  }
});

export default connect(stateToProps, dispatchToProps)(EventStartDateFilter);
