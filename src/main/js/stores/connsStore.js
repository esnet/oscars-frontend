import { observable, action } from 'mobx';

class ConnectionsStore {

    @observable store = {
        conns: [],
        current: {}
    };

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


}

export default new ConnectionsStore();