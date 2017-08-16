import { observable, action } from 'mobx';
import {isArray, mergeWith} from 'lodash';

class ConnectionsStore {

    @observable store = {
        conns: [],
        current: {}
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

    @action setFilter(params) {
        mergeWith(this.filter, params, this.customizer);
    }

    @action setCurrent(conn) {
        this.store.current = conn;
    }

    @action updateList(resvs) {
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