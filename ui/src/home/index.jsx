import React from 'react';
import { Row, Col } from 'antd';

import SearchBoxContainer from '../common/containers/SearchBoxContainer';
import HowToSearch from './components/HowToSearch';
import './index.scss';
import DocumentHead from '../common/components/DocumentHead';
import HomePageSection from './components/HomePageSection';
import HowToSubmit from './components/HowToSubmit';
import CollaborationLogos from './components/CollaborationLogos';

const INSPIRE_DESCRIPTION =
  'INSPIRE is a trusted community hub that helps researchers to share and find accurate scholarly information in high energy physics.';
const META_DESCRIPTION =
  'INSPIRE is the leading information platform for High Energy Physics (HEP) literature which provides users with high quality, curated content covering the entire corpus of HEP literature, authors, data, jobs, conferences, institutions and experiments.';
const TITLE = 'Home';

function Home() {
  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Row className="__Home__" type="flex" justify="center" align="middle">
        <Col span={24}>
          <HomePageSection
            title="Discover High-Energy Physics content"
            description={INSPIRE_DESCRIPTION}
          >
            <SearchBoxContainer />
          </HomePageSection>
          <HomePageSection
            className="bg-white"
            title="How to Search"
            description="INSPIRE supports the most popular SPIRES syntax operators and free text searches for searching papers."
          >
            <HowToSearch />
          </HomePageSection>
          <HomePageSection
            title="How to Submit"
            description="INSPIRE systematically adds content from various sources. Anyone can also submit new content by logging in with their ORCID."
          >
            <HowToSubmit />
          </HomePageSection>
          <HomePageSection className="bg-white" title="INSPIRE Collaboration">
            <CollaborationLogos />
          </HomePageSection>
        </Col>
      </Row>
    </>
  );
}

export default Home;
