import { connect } from 'react-redux';
import { Checkbox } from 'antd';

import { setLiteratureSelection } from '../../actions/literature';

const stateToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'state' implicitly has an 'any' type.
  state,
  {
    recordId
  }: any
) => ({
  checked: state.literature.get('literatureSelection').has(recordId)
});

const dispatchToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'dispatch' implicitly has an 'any' type.
  dispatch,
  {
    recordId
  }: any
) => ({
  onChange(event: any) {
    dispatch(setLiteratureSelection([recordId], event.target.checked));
  }
});

export default connect(stateToProps, dispatchToProps)(Checkbox);
