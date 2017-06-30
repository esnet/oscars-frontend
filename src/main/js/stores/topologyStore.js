import {observable, action} from 'mobx';
import myClient from '../agents/client';

class TopologyStore {
    @observable edgePorts = [];

    @observable portsForFixtures = observable.map({});

    @observable isLoading = false;

    @action loadEdgePorts() {
        if (this.edgePorts.length === 0) {
            this.isLoading = true;
            myClient.loadJSON({method: "GET", url: "/viz/listPorts"})
                .then(action((response) => {
                        this.edgePorts = JSON.parse(response).sort();
                        this.isLoading = false;
                    })
                );
        }

    }

    @action loadPortsForFixtures() {

        if (this.portsForFixtures.size === 0) {
            this.isLoading = true;
            myClient.loadJSON({method: "GET", url: "/topology/portsForFixtures"})
                .then(action((response) => {
                        this.portsForFixtures = JSON.parse(response);
                        this.isLoading = false;

                    })
                );
        }
    }
}

export default new TopologyStore();