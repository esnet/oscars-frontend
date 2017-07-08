import React from 'react';

import ReactDOM from 'react-dom';

import {BrowserRouter as Router, Route} from 'react-router-dom';

import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
// import DevTools from 'mobx-react-devtools'

import ListReservationsApp from './apps/listReservations';
import NewReservationApp from './apps/newReservation';

import commonStore from './stores/commonStore';
import controlsStore from './stores/controlsStore';
import mapStore from './stores/mapStore';
import sandboxStore from './stores/sandboxStore';
import stateStore from './stores/stateStore';
import topologyStore from './stores/topologyStore';

const stores = {
    commonStore,
    controlsStore,
    mapStore,
    sandboxStore,
    stateStore,
    topologyStore,
};
useStrict(true);

ReactDOM.render(
    <Provider {...stores}>
        <Router>
            <div>
                <Route exact path="/" component={NewReservationApp}/>
                <Route exact path="/list" component={ListReservationsApp}/>
                <Route exact path="/frontend" component={NewReservationApp}/>
            </div>
        </Router>
    </Provider>, document.getElementById('react'));