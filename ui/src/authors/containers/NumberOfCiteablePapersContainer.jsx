import { connect } from 'react-redux';

import {
  fetchAuthorPublications,
  fetchAuthorPublicationsFacets,
} from '../../actions/authors';
import LinkLikeButton from '../../common/components/LinkLikeButton';

const CITEABLE_QUERY = { q: 'citeable:true' };

export const dispatchToProps = dispatch => ({
  onClick() {
    dispatch(fetchAuthorPublications(CITEABLE_QUERY));
    dispatch(fetchAuthorPublicationsFacets(CITEABLE_QUERY));
  },
});

export default connect(null, dispatchToProps)(LinkLikeButton);
