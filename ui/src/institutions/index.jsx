import { Component } from 'react';
import { Route, Routes } from 'react-router-dom';

import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';

class Institutions extends Component {
  render() {
    return (
      <div className="w-100">
        <Routes>
          <Route index element={<SearchPageContainer />} />
          <Route path=":id" element={<DetailPageContainer />} />
        </Routes>
      </div>
    );
  }
}

export default Institutions;
