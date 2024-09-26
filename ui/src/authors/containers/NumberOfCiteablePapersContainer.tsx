import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import LinkLikeButton from '../../common/components/LinkLikeButton/LinkLikeButton';
import { CITEABLE_QUERY } from '../../common/constants';
import { searchQueryUpdate } from '../../actions/search';
import { AUTHOR_PUBLICATIONS_NS } from '../../search/constants';

export const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onClick() {
    dispatch(
      searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, {
        page: '1',
        ...CITEABLE_QUERY,
      })
    );
  },
});

export default connect(null, dispatchToProps)(LinkLikeButton);
