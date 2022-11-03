import React from 'react';
import { Row, Col, Card} from 'antd';
import useAxios from 'axios-hooks';
// @ts-ignore
import SanitizedHTML from 'react-sanitized-html';

import Loading from '../../common/components/Loading';
import ExternalLink from '../../common/components/ExternalLink';
import ContentBox from '../../common/components/ContentBox';
import { BLOG_URL } from '../../common/constants';

interface Post {
  id: string;
  link: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  date: string;
}

const MOST_RECENT_BLOG_POSTS_URL = `${BLOG_URL}/wp-json/wp/v2/posts?per_page=3`;

function renderBlogPost(post: Post) {
  return (
    <ExternalLink href={post.link} key={post.id}>
      <Row justify="center">
        <Col sm={24} lg={14} className="mb2 __ContentBox__">
          <Card>
            <div className="pa2">
              <div className="flex flex-nowrap">
                <div className="flex-grow-1">
                  <span className="result-item-title">
                    <SanitizedHTML html={post.title.rendered} />
                  </span>
                </div>
              </div>
              <div className="mt1">
                <SanitizedHTML html={post.excerpt.rendered} />
              </div>
              <span className="db pt1 tr o-60">
                {new Date(post.date).toLocaleDateString()}
              </span>
            </div>
          </Card>
        </Col>
      </Row>
    </ExternalLink>
  );
}

const NewsAndUpdates = () => {
  const [{ data, loading }] = useAxios(MOST_RECENT_BLOG_POSTS_URL);

  return (
    <>
      <Row justify="center" className="__NewsAndUpdates__">
        <Col>
          <ContentBox className="container">
            {loading ? (
              <Loading />
            ) : data ? (
              data.map((post: Post) => (
                <div data-test-id="news-post">{renderBlogPost(post)}</div>
              ))
            ) : (
              <span>No new updates</span>
            )}
          </ContentBox>
        </Col>
      </Row>
      <Row justify="center">
        <Col>
          <ExternalLink
            className="db tc f5 mt4"
            href="https://blog.inspirehep.net/"
          >
            View all
          </ExternalLink>
        </Col>
      </Row>
    </>
  );
};

export default NewsAndUpdates;
