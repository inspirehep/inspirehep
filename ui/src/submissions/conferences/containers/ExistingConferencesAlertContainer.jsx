import { connect } from 'react-redux';
import { EXISTING_CONFERENCES_NS } from '../../../search/constants';
import { RANGE_AGGREGATION_SELECTION_SEPARATOR } from '../../../common/constants';
import { searchQueryUpdate } from '../../../actions/search';
import ExistingConferencesAlert from '../components/ExistingConferencesAlert';

const stateToProps = state => ({
  numberOfConferences: state.search.getIn([
    'namespaces',
    EXISTING_CONFERENCES_NS,
    'total',
  ]),
});

const dispatchToProps = dispatch => ({
  onDatesChange([openingDate, closingDate]) {
    dispatch(
      searchQueryUpdate(EXISTING_CONFERENCES_NS, {
        contains: `${openingDate}${RANGE_AGGREGATION_SELECTION_SEPARATOR}${closingDate}`,
      })
    );
  },
});

export default connect(stateToProps, dispatchToProps)(ExistingConferencesAlert);
