import {observable, action} from 'mobx';

class SandboxStore {
    @observable sandbox = {
        junctions: [],
        fixtures: [],
        pipes: [],
    };

    @observable selection = {
        device: '',
        port: '',
        fixture: '',
        vlan: '',
        junction: '',
        ingress: 0,
        egress: 0,
        pipe: {
            a: '',
            z: ''
        }
    };

    @observable connState = 'INITIAL';

    @observable modals = observable.map({
        'connection': false,
        'port': false,
        'fixture': false,
        'junction': false,
        'pipe': false,
        'device': false
    });

    findFixture(id) {
        let result = null;
        this.sandbox.fixtures.map((f) => {
           if (f.id === id) {
               result = f;
           }
        });
        return result;
    }



    @action addFixture(port, device, vlan, ingress, egress) {
        let idx = 0;
        let id = port + '-' + idx;
        let idMightBeTaken = true;
        while (idMightBeTaken) {
            let idIsTaken = false;
            this.sandbox.fixtures.map((e) => {
                if (e.id === id) {
                    idIsTaken = true;
                }
            });
            if (!idIsTaken) {
                idMightBeTaken = false;
            } else {
                idx += 1;
                id = port +'-'+ idx;
            }
        }

        this.sandbox.fixtures.push(
            {
                'id': id,
                'port': port,
                'device': device,
                'vlan': vlan,
                'ingress': ingress,
                'egress': egress,
            });

        this.addJunction(device);

        return id;
    }

    @action addJunction(device) {
        let junctionExists = false;
        let otherDeviceExists = false;
        let otherDevice = null;
        this.sandbox.junctions.map((j) => {
            if (j.id === device) {
                junctionExists = true;
            } else {
                otherDeviceExists = true;
                otherDevice = j.id;
            }
        });
        if (!junctionExists) {
            this.sandbox.junctions.push({
                    'id': device,
            });
            if (otherDeviceExists) {
                let newPipe = {
                    a: device,
                    z: otherDevice,
                    azBw: 0,
                    zaBw: 0
                };

                this.sandbox.pipes.push(newPipe);
            }

        }

    }

    @action addPipe(pipe) {
        this.sandbox.pipes.push(pipe);
    }

    @action updatePipe(pipe) {
        this.sandbox.pipes.map((entry) => {
            if (entry.a === pipe.a && entry.z === pipe.z) {
                entry.azBw = pipe.azBw;
                entry.zaBw = pipe.zaBw;
            } else if (entry.a === pipe.z && entry.z === pipe.a) {
                entry.azBw = pipe.zaBw;
                entry.zaBw = pipe.azBw;
            }
        });
    }

    @action deletePipe(a, z) {
        let idxToRemove = -1;
        this.sandbox.pipes.map((entry, index) => {
            if (entry.a === a && entry.z === z) {
                idxToRemove = index;
            } else if (entry.a === z && entry.z === a) {
                idxToRemove = index;
            }
        });
        if (idxToRemove > -1) {
            this.sandbox.pipes.splice(idxToRemove, 1);
        }
    }



    @action updateFixture(id, vlan, ingress, egress) {
        this.sandbox.fixtures.map((entry) => {
            if (entry.id === id) {
                entry.vlan = vlan;
                entry.ingress = ingress;
                entry.egress = egress;
            }
        });
    }


    @action deleteFixture(id) {
        let idxToRemove = -1;
        let affectedJunction = '';
        this.sandbox.fixtures.map((entry, index) => {
            if (entry.id === id) {
                idxToRemove = index;
                affectedJunction = entry.device;
            }
        });
        if (idxToRemove > -1) {
            this.sandbox.fixtures.splice(idxToRemove, 1);
            let junctionStillHasFixtures = false;
            this.sandbox.fixtures.map((entry) => {
                if (entry.device === affectedJunction) {
                    console.log(id+' still has fixtures remaining');
                    junctionStillHasFixtures = true;
                }
            });

            if (!junctionStillHasFixtures) {
                this.deleteJunction(affectedJunction);
            }

        }
    }
    @action deleteJunction(id) {
        let idxToRemove = -1;
        this.sandbox.junctions.map((entry, index) => {
            if (entry.id === id) {
                idxToRemove = index;
            }
        });
        let pipesToRemove = [];
        if (idxToRemove > -1) {
            this.sandbox.pipes.map((entry, index) => {
                if (entry.a === id || entry.z === id) {
                    pipesToRemove.push(entry);
                }
            });
            this.sandbox.junctions.splice(idxToRemove, 1);
        }
        pipesToRemove.map((p) => {
            let pipeIdxToRemove = -1;
            this.sandbox.pipes.map((entry, index) => {
                if (entry.a === p.a && entry.z === p.z) {
                    pipeIdxToRemove = index;
                }
            });
            if (pipeIdxToRemove > -1) {
                this.sandbox.pipes.splice(pipeIdxToRemove, 1);
            }
        });
    }


    @action openModal(type) {
        this.modals.set(type, true);
    }

    @action closeModal(type) {
        this.modals.set(type, false);
    }

    @action closeModals() {
        this.modals.forEach((value, key) => {
            this.modals.set(key, false);
        });
    }

    @action selectJunction(junction) {
        this.selection.junction = junction;
        this.closeModals();
        this.openModal('junction');
    }

    @action selectDevice(device) {
        this.selection.device = device;
        this.closeModals();
        this.openModal('device');
    }

    @action selectPort(urn, device) {
        this.selection.port = urn;
        this.selection.device = device;
        this.closeModals();
        this.openModal('port');
    }

    @action selectFixture(id, openModal) {
        this.selection.fixture = id;
        this.sandbox.fixtures.map((entry) => {
            if (entry.id === id) {
                this.selection.device = entry.device;
                this.selection.port = entry.port;
                this.selection.vlan = entry.vlan;
                this.selection.ingress = entry.ingress;
                this.selection.egress = entry.egress;
            }
        });
        this.closeModals();
        if (openModal) {
            this.openModal('fixture');
        }
    }


    @action reset() {
        this.connState = 'INITIAL';
    }

    @action validate() {
        if (this.connState === 'INITIAL') {
            this.connState = 'VALIDATING';
        }
    }

    @action postValidate(ok) {
        if (ok) {
            this.connState = 'VALIDATE_OK';
        } else {
            this.connState = 'INITIAL';
        }
    }

    @action check() {
        if (this.connState === 'INITIAL') {
            this.connState = 'CHECKING';
        }
    }

    @action postCheck(ok) {
        if (ok) {
            this.connState = 'CHECK_OK';
        } else {
            this.connState = 'INITIAL';
        }
    }

    @action hold() {
        if (this.connState === 'CHECK_OK') {
            this.connState = 'HOLDING';
        }
    }

    @action postHold(ok) {
        if (ok) {
            this.connState = 'HOLD_OK';
        } else {
            this.connState = 'INITIAL';
        }
    }

    @action commit() {
        if (this.connState === 'HOLD_OK') {
            this.connState = 'COMMITTING';
        }
    }

    @action postCommit(ok) {
        if (ok) {
            this.connState = 'COMMITTED';
        } else {
            this.connState = 'INITIAL';
        }
    }


}

export default new SandboxStore();