import { connect } from 'react-redux';

import { fetchCitationSummary } from '../../actions/citations';
import ExcludeSelfCitations from '../components/ExcludeSelfCitations';
import { EXCLUDE_SELF_CITATIONS_PREFERENCE } from '../../reducers/user';
import { appendQueryToLocationSearch } from '../../actions/router';
import { setPreference } from '../../actions/user';
import {
  CITATION_COUNT_PARAM,
  CITATION_COUNT_WITHOUT_SELF_CITATIONS_PARAM,
  UI_EXCLUDE_SELF_CITATIONS_PARAM,
} from '../../common/constants';
import { searchQueryUpdate } from '../../actions/search';
import {
  selfCitationsExcludedOnLocation,
  selfCitationsExcludedOnUserPreferences,
} from '../../reducers/citations';

const stateToProps = state => ({
  excluded: selfCitationsExcludedOnLocation(state),
  preference: selfCitationsExcludedOnUserPreferences(state),
});

const dispatchToProps = (dispatch, { namespace }) => ({
  onChange(excluded) {
    dispatch(setPreference(EXCLUDE_SELF_CITATIONS_PREFERENCE, excluded));
    dispatch(
      searchQueryUpdate(namespace, {
        [CITATION_COUNT_PARAM]: undefined,
        [CITATION_COUNT_WITHOUT_SELF_CITATIONS_PARAM]: undefined,
      })
    );
    if (!excluded) {
      dispatch(
        appendQueryToLocationSearch({
          [UI_EXCLUDE_SELF_CITATIONS_PARAM]: undefined,
        })
      );
    }
    dispatch(fetchCitationSummary(namespace));
  },
  onPreferenceChange(preference) {
    if (preference) {
      dispatch(
        appendQueryToLocationSearch({ [UI_EXCLUDE_SELF_CITATIONS_PARAM]: true })
      );
    }
  },
});

export default connect(stateToProps, dispatchToProps)(ExcludeSelfCitations);
