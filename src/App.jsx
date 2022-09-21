import React, { Component } from 'react'
import { Switch, Route, HashRouter } from 'react-router-dom';
import Home from './pages/home';

export default class App extends Component {

  render() {
    return (
      <HashRouter>
        <Switch>
          <Route exact path="/" component={Home} />
        </Switch>
      </HashRouter>
    )
  }

}
