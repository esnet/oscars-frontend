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
    @observable availPortsByDevice = observable.map({});

    /* format :
     [
     { id: port1, label: port1, device: device1 },
     { id: port2, label: port2, device: device1 },
     { id: port3, label: port3, device: device2 },
     ]
     */
    @computed
    get availPorts() {
        let byPort = [];
        this.availPortsByDevice.forEach((ports, device) => {
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


    @observable isLoading = false;


    @action loadAvailablePorts() {

        if (this.availPortsByDevice.size === 0) {
            this.isLoading = true;
            myClient.loadJSON({method: 'GET', url: '/topology/portsForFixtures'})
                .then(action((response) => {
                    let parsed = JSON.parse(response);
                    this.availPortsByDevice = observable.map([]);
                    let devices = [];
                    for (let key in parsed) {
                        if (parsed.hasOwnProperty(key)) {
                            devices.push(key);
                        }
                    }
                    devices.sort().map((d) => {
                        this.availPortsByDevice.set(d, parsed[d]);

                    });
                }));
        }
    }
}

export default new TopologyStore();