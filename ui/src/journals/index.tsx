import { Route, Routes } from 'react-router-dom';

import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';

const Journals = () => (
  <div className="w-100" data-testid="journals">
    <Routes>
      <Route index element={<SearchPageContainer />} />
      <Route path=":id" element={<DetailPageContainer />} />
    </Routes>
  </div>
);

export default Journals;
