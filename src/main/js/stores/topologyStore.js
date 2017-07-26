import {observable, action, computed} from 'mobx';
import myClient from '../agents/client';

class TopologyStore {


    /*
     format :
     {
     device1: ['port1, '[port2'],
     device2: ['port3],
     }
     */
    @observable ethPortsByDevice = observable.map({});


    @action loadEthernetPorts() {

        if (this.ethPortsByDevice.size === 0) {
            myClient.loadJSON({method: 'GET', url: '/api/topo/ethernetPortsByDevice'})
                .then(action((response) => {
                    let parsed = JSON.parse(response);
                    this.ethPortsByDevice = observable.map({});

                    let devices = [];
                    for (let key in parsed) {
                        if (parsed.hasOwnProperty(key)) {
                            devices.push(key);
                        }
                    }
                    devices.sort().map((d) => {
                        this.ethPortsByDevice.set(d, parsed[d]);
                    });
                }));
        }
    }

    /* format (for typeahead control):
     [
     { id: port1, label: port1, device: device1 },
     { id: port2, label: port2, device: device1 },
     { id: port3, label: port3, device: device2 },
     ]
     */

    @computed get ethPorts() {
        let byPort = [];
        this.ethPortsByDevice.forEach((ports, device) => {
            ports.map(
                (port) => {
                    byPort.push(
                        {
                            'id': port,
                            'label': port,
                            'device': device
                        }
                    )
                }
            );
        });

        return byPort;
    }

    /* format: {
           "port urn": {
              "vlanRanges": [{
                  "floor" : 2000,
                  "ceiling" : 2999
                }
              ],
              "vlanExpression": "2000-2999",
              "ingressBandwidth" : 10000,
              "egressBandwidth" : 10000

           }
       }
     */
    @observable baseline = observable.map({});
    @observable available = observable.map({});


    @action loadBaseline() {
        if (this.baseline.size === 0) {
            myClient.loadJSON({method: 'GET', url: '/api/topo/baseline'})
                .then(action((response) => {
                    this.baseline = JSON.parse(response);
                }));

        }
    }
    @action loadAvailable(b, e) {
        let params = {
            beginning: b,
            ending: e
        };
        myClient.loadJSON({method: 'POST', url: '/api/topo/available', params})
            .then(action((response) => {
                this.available = JSON.parse(response);
            }));

    }

}

export default new TopologyStore();