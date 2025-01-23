import React, { useRef } from 'react';
import { Row, Col } from 'antd';

import SearchBoxContainer from '../common/containers/SearchBoxContainer';
import HowToSearch from './components/HowToSearch';
import './index.less';
import DocumentHead from '../common/components/DocumentHead';
import HomePageSection from './components/HomePageSection';
import HowToSubmit from './components/HowToSubmit';
import CollaborationLogos from './components/CollaborationLogos';
import LinkLikeButton from '../common/components/LinkLikeButton/LinkLikeButton';
import NewsAndUpdates from './components/NewsAndUpdates';
import EventTracker from '../common/components/EventTracker';

const INSPIRE_DESCRIPTION =
  'INSPIRE is a trusted community hub that helps researchers to share and find accurate scholarly information in high energy physics.';
const META_DESCRIPTION =
  'INSPIRE is the leading information platform for High Energy Physics (HEP) literature which provides users with high quality, curated content covering the entire corpus of HEP literature, authors, data, jobs, conferences, institutions and experiments.';
const TITLE = 'Home';

function Home() {
  const refElement = useRef(null);
  const scrollToSection = () =>
    refElement.current.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Row
        className="__Home__"
        justify="center"
        align="middle"
        data-testid="home"
      >
        <Col span={24}>
          <HomePageSection
            title="Discover High-Energy Physics Content"
            description={INSPIRE_DESCRIPTION}
          >
            <>
              <SearchBoxContainer />
              <div className="tc f5 mt4" data-test-id="scroll-button">
                <EventTracker
                  eventCategory="Home page"
                  eventAction="Link"
                  eventId="How to search"
                >
                  <LinkLikeButton onClick={scrollToSection} color="blue middle">
                    How to search?
                  </LinkLikeButton>
                </EventTracker>
              </div>
            </>
          </HomePageSection>
          <HomePageSection className="bg-white">
            <>
              <h3 className="tc ttu mb4">Brought to you by</h3>
              <CollaborationLogos />
            </>
          </HomePageSection>
          <HomePageSection title="News and updates">
            <NewsAndUpdates />
          </HomePageSection>
          <div ref={refElement} data-test-id="how-to-search">
            <HomePageSection
              title="How to Search"
              className="bg-white"
              description="INSPIRE supports the most popular SPIRES syntax operators and free text searches for searching papers."
            >
              <HowToSearch />
            </HomePageSection>
          </div>
          <HomePageSection
            title="How to Submit"
            description="INSPIRE systematically adds content from various sources. Anyone can also submit new content by logging in with their ORCID."
          >
            <HowToSubmit />
          </HomePageSection>
        </Col>
      </Row>
    </>
  );
}

export default Home;
