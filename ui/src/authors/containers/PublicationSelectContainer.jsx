import { connect } from 'react-redux';
import { Checkbox } from 'antd';

import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
} from '../../actions/authors';

const stateToProps = (state, { recordId }) => ({
  checked: state.authors.get('publicationSelection').has(recordId),
});

const dispatchToProps = (dispatch, { recordId, claimed }) => ({
  onChange(event) {
    if (claimed) {
      dispatch(
        setPublicationsClaimedSelection([recordId], event.target.checked)
      );
    } else {
      dispatch(
        setPublicationsUnclaimedSelection([recordId], event.target.checked)
      );
    }
    dispatch(setPublicationSelection([recordId], event.target.checked));
  },
});

export default connect(stateToProps, dispatchToProps)(Checkbox);
