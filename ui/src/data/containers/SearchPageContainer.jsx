import React from 'react';
import DocumentHead from '../../common/components/DocumentHead';
import DataSearchPageContainer from './DataSearchPageContainer';
import { DATA_NS } from '../../search/constants';

const META_DESCRIPTION = 'Find data in High Energy Physics';
const TITLE = 'Data Search';

const SearchPage = () => (
  <>
    <DocumentHead title={TITLE} description={META_DESCRIPTION} />
    <DataSearchPageContainer namespace={DATA_NS} />
  </>
);

export default SearchPage;
