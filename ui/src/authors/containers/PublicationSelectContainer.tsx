import { connect } from 'react-redux';
import PublicationsSelect from '../components/PublicationsSelect';

import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
  setPublicationsCanNotClaimSelection,
} from '../../actions/authors';

const stateToProps = (state, { recordId }) => ({
  checked: state.authors.get('publicationSelection').has(recordId),
});

const dispatchToProps = (dispatch, { recordId }) => ({
  onSelectPapersUserCanNotClaim(event) {
    dispatch(
      setPublicationsCanNotClaimSelection([recordId], event.target.checked)
    );
  },
  onSelectClaimedPapers(event) {
    dispatch(setPublicationsClaimedSelection([recordId], event.target.checked));
  },

  onSelectUnclaimedPapers(event) {
    dispatch(
      setPublicationsUnclaimedSelection([recordId], event.target.checked)
    );
  },
  onSelectPapers(event) {
    dispatch(setPublicationSelection([recordId], event.target.checked));
  },
});

export default connect(stateToProps, dispatchToProps)(PublicationsSelect);
