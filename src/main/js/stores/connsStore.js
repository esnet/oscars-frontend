import { observable, action } from 'mobx';
import {isArray, mergeWith} from 'lodash';

class ConnectionsStore {

    @observable store = {
        conns: [],
        current: {},
        foundCurrent: false,
        selected: {},
        commands: new Map(),
        statuses: new Map(),
    };

    @observable controls = {
        general: {
            build: {
                display: false,
                enable: false,
                clicked: false
            },
            dismantle: {
                display: false,
                enable: false,
                clicked: false
            },
            auto: {
                display: false,
                enable: false,
                clicked: false
            },
            manual: {
                display: false,
                enable: false,
                clicked: false
            },
            cancel: {
                display: false,
                enable: false,
                clicked: false
            }
        }
    };

    @observable filter = {
        criteria: [],
        ports: [],
        vlans: [],
        username: '',
        description: '',
        phase: 'RESERVED',
        state: 'ACTIVE',
    };

    @action setCommands(commands) {
        this.store.commands = commands;
    }

    @action setControl(unit, control, params) {
        this.controls[unit][control] = params;
    }


    @action setStatuses(device, statuses) {
        this.store.statuses[device] = statuses;
    }


    @action setFilter(params) {
        mergeWith(this.filter, params, this.customizer);
    }

    @action setCurrent(conn) {
        this.store.current = conn;
        this.store.foundCurrent = true;
    }
    @action clearCurrent() {
        this.store.current = {};
        this.store.foundCurrent = false;
    }

    @action setSelected(component) {
        this.store.selected = component;
    }

    @action updateList(resvs) {
        this.store.conns = [];
        this.store.conns = resvs;
    }

    findConnection(connectionId) {
        for (let conn of this.store.conns) {
            if (conn.connectionId === connectionId) {
                return conn;
            }
        }
    }


    customizer = (objValue, srcValue) => {
        if (isArray(srcValue)) {
            return srcValue;
        }
    }

}

export default new ConnectionsStore();