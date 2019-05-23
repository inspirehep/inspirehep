import { connect } from 'react-redux';

import {
  fetchAuthorPublications,
  fetchAuthorPublicationsFacets,
} from '../../actions/authors';
import LinkLikeButton from '../../common/components/LinkLikeButton';
import { CITEABLE_QUERY } from '../../common/constants';

export const dispatchToProps = dispatch => ({
  onClick() {
    dispatch(fetchAuthorPublications(CITEABLE_QUERY));
    dispatch(fetchAuthorPublicationsFacets(CITEABLE_QUERY));
  },
});

export default connect(null, dispatchToProps)(LinkLikeButton);
