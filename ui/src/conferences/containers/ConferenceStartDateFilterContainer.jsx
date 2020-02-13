import { connect } from 'react-redux';

import { searchQueryUpdate } from '../../actions/search';
import ConferenceStartDateFilter from '../components/ConferenceStartDateFilter';
import { CONFERENCES_NS } from '../../reducers/search';
import { START_DATE_UPCOMING, START_DATE_ALL } from '../../common/constants';

const START_DATE = 'start_date';
const DATE_ASC = 'dateasc';
const DATE_DESC = 'datedesc';

const stateToProps = state => ({
  selection: state.search.getIn([
    'namespaces',
    CONFERENCES_NS,
    'query',
    START_DATE,
  ]),
});

export const dispatchToProps = dispatch => ({
  onChange(selection) {
    const query = { [START_DATE]: selection, page: '1' };

    if (selection === START_DATE_UPCOMING) {
      query.sort = DATE_ASC;
    } else if (selection === START_DATE_ALL) {
      query.sort = DATE_DESC;
    }

    dispatch(searchQueryUpdate(CONFERENCES_NS, query));
  },
});

export default connect(stateToProps, dispatchToProps)(
  ConferenceStartDateFilter
);
