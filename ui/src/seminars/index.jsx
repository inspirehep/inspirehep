import { Component } from 'react';
import { Route, Routes } from 'react-router-dom';

import SearchPage from './components/SearchPage';
import DetailPageContainer from './containers/DetailPageContainer';

class Seminars extends Component {
  render() {
    return (
      <div className="w-100">
        <Routes>
          <Route index element={<SearchPage />} />
          <Route path=":id" element={<DetailPageContainer />} />
        </Routes>
      </div>
    );
  }
}

export default Seminars;
