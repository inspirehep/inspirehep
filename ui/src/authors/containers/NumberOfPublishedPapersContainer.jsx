import { connect } from 'react-redux';

import {
  fetchAuthorPublications,
  fetchAuthorPublicationsFacets,
} from '../../actions/authors';
import LinkLikeButton from '../../common/components/LinkLikeButton';
import { PUBLISHED_QUERY } from '../../common/constants';

export const dispatchToProps = dispatch => ({
  onClick() {
    dispatch(fetchAuthorPublications(PUBLISHED_QUERY));
    dispatch(fetchAuthorPublicationsFacets(PUBLISHED_QUERY));
  },
});

export default connect(null, dispatchToProps)(LinkLikeButton);
