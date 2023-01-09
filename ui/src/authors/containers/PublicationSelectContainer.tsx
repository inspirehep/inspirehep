import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import PublicationsSelect from '../components/PublicationsSelect';
import {
  setPublicationSelection,
  setPublicationsClaimedSelection,
  setPublicationsUnclaimedSelection,
} from '../../actions/authors';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const stateToProps = (state: RootStateOrAny, { recordId }: { recordId: number }) => ({
  checked: state.authors.get('publicationSelection').has(recordId),
});

const dispatchToProps = (dispatch: ActionCreator<Action>, { recordId }: { recordId: number }) => ({
  onSelectClaimedPapers(event: CheckboxChangeEvent) {
    dispatch(setPublicationsClaimedSelection([recordId], event.target.checked));
  },

  onSelectUnclaimedPapers(event: CheckboxChangeEvent) {
    dispatch(
      setPublicationsUnclaimedSelection([recordId], event.target.checked)
    );
  },
  onSelectPapers(event: CheckboxChangeEvent) {
    dispatch(setPublicationSelection([recordId], event.target.checked));
  },
});

export default connect(stateToProps, dispatchToProps)(PublicationsSelect);
