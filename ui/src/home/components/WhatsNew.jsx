import React from 'react';
import { Row, Col } from 'antd';
import useAxios from 'axios-hooks';

import ExternalLink from '../../common/components/ExternalLink';
import ContentBox from '../../common/components/ContentBox';
import { BLOG_URL } from '../../common/constants';

const MOST_RECENT_BLOG_POSTS_URL = `${BLOG_URL}/wp-json/wp/v2/posts?per_page=3&context=embed`;

function renderBlogPost(post) {
  return (
    <div key={post.id}>
      <ExternalLink href={post.link}>{post.title.rendered}</ExternalLink>
    </div>
  );
}

function WhatsNew() {
  const [{ data, loading }] = useAxios(MOST_RECENT_BLOG_POSTS_URL);
  return (
    <Row justify="center">
      <Col>
        <ContentBox loading={loading}>
          {data && data.map(renderBlogPost)}
        </ContentBox>
      </Col>
    </Row>
  );
}

export default WhatsNew;
