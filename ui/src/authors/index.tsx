import { Component } from 'react';
import { Route, Routes } from 'react-router-dom';

import './index.less';
import SearchPageContainer from './containers/SearchPageContainer';
import DetailPageContainer from './containers/DetailPageContainer';

class Authors extends Component {
  render() {
    return (
      <div className="__Authors__" data-testid="authors">
        <Routes>
          <Route index element={<SearchPageContainer />} />
          <Route path=":id" element={<DetailPageContainer />} />
        </Routes>
      </div>
    );
  }
}

export default Authors;
