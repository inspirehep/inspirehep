import { connect } from 'react-redux';

import {
  fetchAuthorPublications,
  fetchAuthorPublicationsFacets,
} from '../../actions/authors';
import LinkLikeButton from '../../common/components/LinkLikeButton';

const PUBLISHED_QUERY = { q: 'citeable:true and refereed:true' };

export const dispatchToProps = dispatch => ({
  onClick() {
    dispatch(fetchAuthorPublications(PUBLISHED_QUERY));
    dispatch(fetchAuthorPublicationsFacets(PUBLISHED_QUERY));
  },
});

export default connect(null, dispatchToProps)(LinkLikeButton);
