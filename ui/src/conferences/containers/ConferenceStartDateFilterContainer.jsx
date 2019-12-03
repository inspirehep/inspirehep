import { connect } from 'react-redux';

import { searchQueryUpdate } from '../../actions/search';
import ConferenceStartDateFilter from '../components/ConferenceStartDateFilter';
import { CONFERENCES_NS } from '../../reducers/search';

const START_DATE = 'start_date';

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
    dispatch(
      searchQueryUpdate(CONFERENCES_NS, { [START_DATE]: selection, page: '1' })
    );
  },
});

export default connect(stateToProps, dispatchToProps)(
  ConferenceStartDateFilter
);
