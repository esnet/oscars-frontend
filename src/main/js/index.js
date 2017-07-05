import React from 'react';

import ReactDOM from 'react-dom';

import {BrowserRouter as Router, Route} from 'react-router-dom';

import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
// import DevTools from 'mobx-react-devtools'

import Welcome from './apps/welcome';
import NewReservationApp from './apps/newReservation';

import commonStore from './stores/commonStore';
import controlsStore from './stores/controlsStore';
import sandboxStore from './stores/sandboxStore';
import stateStore from './stores/stateStore';
import topologyStore from './stores/topologyStore';

const stores = {
    commonStore,
    controlsStore,
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
                <Route exact path="/welcome" component={Welcome}/>
                <Route exact path="/react/new" component={NewReservationApp}/>
            </div>
        </Router>
    </Provider>, document.getElementById('react'));