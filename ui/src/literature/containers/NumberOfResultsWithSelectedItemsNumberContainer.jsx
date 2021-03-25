import { connect } from 'react-redux';

import NumberOfResultsWithSelectedItemsNumber from '../components/NumberOfResultsWithSelectedItemsNumber';

const stateToProps = (state) => ({
  numberOfSelected: state.literature.get('literatureSelection').size,
});

export default connect(stateToProps)(NumberOfResultsWithSelectedItemsNumber);
