import { observable, action } from 'mobx';
import {isArray, mergeWith} from 'lodash-es';
import transformer from "../lib/transform";
import myClient from "../agents/client";

class ConnectionsStore {

    @observable store = {
        conns: [],
        current: {
            archived: {
                cmp: {},
                schedule: {
                    beginning: null,
                    ending: null

                }
            },
            tags: [],
            dirty: false

        },
        foundCurrent: false,
        selected: {},
        commands: new Map(),
        statuses: new Map(),
    };

    @observable controls = {
        buildmode: {
            ok: false,
            show: false,
            text: ''
        },
        build: {
            ok: false,
            show: false,
            text: ''
        },
        dismantle: {
            ok: false,
            show: false,
            text: ''
        },
        release: {
            ok: false,
            show: false,
            text: ''
        },
        help: {
            build: {
                'header': null,
                'body': null,
            },
            buildMode: {
                'header': null,
                'body': null,
            },
            release: {
                'header': null,
                'body': null,
            },
            dismantle: {
                'header': null,
                'body': null,
            },

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

    @action setControl(unit, params) {
        this.controls[unit] = params;
    }
    @action setControlHelp(unit, params) {
        this.controls.help[unit] = params;
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
    @action refreshCurrent() {
        myClient.submitWithToken('GET', '/api/conn/info/' + this.store.current.connectionId)
            .then(action(
                (response) => {
                    let conn = JSON.parse(response);
                    transformer.fixSerialization(conn);
                    this.setCurrent(conn);

                }));


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