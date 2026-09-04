import { legacy_connect as connect } from 'react-redux';
import { Checkbox } from 'antd';

import { setLiteratureSelection } from '../../actions/literature';

const stateToProps = (state, { recordId }) => ({
  checked: state.literature.get('literatureSelection').has(recordId),
});

const dispatchToProps = (dispatch, { recordId }) => ({
  onChange(event) {
    dispatch(setLiteratureSelection([recordId], event.target.checked));
  },
});

const mergeProps = (stateProps, dispatchProps, { recordId, ...ownProps }) => ({
  ...ownProps,
  ...stateProps,
  ...dispatchProps,
});

export default connect(stateToProps, dispatchToProps, mergeProps)(Checkbox);
