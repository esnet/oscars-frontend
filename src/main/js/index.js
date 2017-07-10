import React from 'react';

import ReactDOM from 'react-dom';

import {BrowserRouter as Router, Route} from 'react-router-dom';

import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
// import DevTools from 'mobx-react-devtools'

import ListConnectionsApp from './apps/listConnections';
import NewConnectionApp from './apps/newConnection';

import commonStore from './stores/commonStore';
import controlsStore from './stores/controlsStore';
import mapStore from './stores/mapStore';
import sandboxStore from './stores/sandboxStore';
import stateStore from './stores/stateStore';
import topologyStore from './stores/topologyStore';
import connsStore from './stores/connsStore';

const stores = {
    commonStore,
    connsStore,
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
                <Route exact path="/" component={ListConnectionsApp}/>
                <Route exact path="/list" component={ListConnectionsApp}/>
                <Route exact path="/frontend" component={NewConnectionApp}/>
            </div>
        </Router>
    </Provider>, document.getElementById('react'));