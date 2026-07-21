import { Component } from 'react';
import { Route, Routes } from 'react-router-dom';

import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';

class Conferences extends Component {
  render() {
    return (
      <div className="w-100" data-testid="conferences">
        <Routes>
          <Route index element={<SearchPageContainer />} />
          <Route path=":id" element={<DetailPageContainer />} />
        </Routes>
      </div>
    );
  }
}

export default Conferences;
