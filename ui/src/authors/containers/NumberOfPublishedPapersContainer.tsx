import { connect } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import LinkLikeButton from '../../common/components/LinkLikeButton/LinkLikeButton';
import { PUBLISHED_QUERY } from '../../common/constants';
import { searchQueryUpdate } from '../../actions/search';
import { AUTHOR_PUBLICATIONS_NS } from '../../search/constants';

export const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onClick() {
    dispatch(
      searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, {
        page: '1',
        ...PUBLISHED_QUERY,
      })
    );
  },
});

export default connect(null, dispatchToProps)(LinkLikeButton);
