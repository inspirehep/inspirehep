// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import LinkLikeButton from '../../common/components/LinkLikeButton';
import { CITEABLE_QUERY } from '../../common/constants';
import { searchQueryUpdate } from '../../actions/search';
import { AUTHOR_PUBLICATIONS_NS } from '../../search/constants';

export const dispatchToProps = (dispatch: $TSFixMe) => ({
  onClick() {
    dispatch(
      searchQueryUpdate(AUTHOR_PUBLICATIONS_NS, {
        page: '1',
        ...CITEABLE_QUERY,
      })
    );
  }
});

export default connect(null, dispatchToProps)(LinkLikeButton);
