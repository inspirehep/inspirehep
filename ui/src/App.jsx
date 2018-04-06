import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';

import './App.css';
import Holdingpen from './holdingpen';

class App extends Component {
  render() {
    return (
      <div>
        <header>
          <h5>inspire-next</h5>
          <Link to="/holdingpen">Holdingpen</Link>
        </header>

        <main>
          <Route exact path="/holdingpen" component={Holdingpen} />
        </main>
      </div>
    );
  }
}

export default App;
