import { connect } from 'react-redux';
import { Checkbox } from 'antd';

import { setPulicationSelection } from '../../actions/authors';

const stateToProps = (state, { recordId }) => ({
  checked: state.authors.get('publicationSelection').has(recordId),
});

const dispatchToProps = (dispatch, { recordId }) => ({
  onChange(event) {
    dispatch(setPulicationSelection([recordId], event.target.checked));
  },
});

export default connect(stateToProps, dispatchToProps)(Checkbox);
