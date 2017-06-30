import React from 'react';

import ReactDOM from 'react-dom';

import {BrowserRouter as Router, Route} from 'react-router-dom';

import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';

import Welcome from './apps/welcome';
import NewReservationApp from './apps/newReservation';
import NavBar from './components/navbar'

import sandboxStore from './stores/sandboxStore';
import topologyStore from './stores/topologyStore';
import commonStore from './stores/commonStore';

const stores = {
    topologyStore,
    commonStore,
    sandboxStore
};
useStrict(true);

ReactDOM.render(
    <Provider {...stores}>
        <Router>
            <div>
                <NavBar/>
                <Route exact path="/" component={NewReservationApp}/>
                <Route exact path="/welcome" component={Welcome}/>
                <Route exact path="/react/new" component={NewReservationApp}/>
            </div>
        </Router>
    </Provider>, document.getElementById('react'));