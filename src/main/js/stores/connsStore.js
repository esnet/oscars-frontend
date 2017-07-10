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


}

export default new ConnectionsStore();