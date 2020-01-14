import { connect } from 'react-redux';

import LinkLikeButton from '../../common/components/LinkLikeButton';
import { PUBLISHED_QUERY } from '../../common/constants';
import { searchQueryUpdate } from '../../actions/search';
import { AUTHOR_PUBLICATIONS_NS } from '../../reducers/search';

export const dispatchToProps = dispatch => ({
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
