import { connect } from 'react-redux';
import { EXISTING_CONFERENCES_NS } from '../../../search/constants';
import { RANGE_AGGREGATION_SELECTION_SEPARATOR } from '../../../common/constants';
import { searchQueryUpdate } from '../../../actions/search';
import ExistingConferencesAlert from '../components/ExistingConferencesAlert';

const stateToProps = (state: any) => ({
  numberOfConferences: state.search.getIn([
    'namespaces',
    EXISTING_CONFERENCES_NS,
    'total',
  ])
});

const dispatchToProps = (dispatch: any) => ({
  // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'openingDate' implicitly has an 'a... Remove this comment to see the full error message
  onDatesChange([openingDate, closingDate]) {
    dispatch(
      searchQueryUpdate(EXISTING_CONFERENCES_NS, {
        contains: `${openingDate}${RANGE_AGGREGATION_SELECTION_SEPARATOR}${closingDate}`,
      })
    );
  }
});

// @ts-ignore
export default connect(stateToProps, dispatchToProps)(ExistingConferencesAlert);
