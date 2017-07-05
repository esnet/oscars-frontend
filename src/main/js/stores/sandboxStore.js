import {observable, action} from 'mobx';

class SandboxStore {
    @observable sandbox = {
        junctions: [],
        fixtures: [],
        pipes: [],
    };


    findFixture(id) {
        let result = null;
        this.sandbox.fixtures.map((f) => {
            if (f.id === id) {
                result = f;
            }
        });
        return result;
    }

    static nextChar(c) {
        return String.fromCharCode(c.charCodeAt(0) + 1);
    }

    makeFixtureId(port) {
        let suffix = 'a';
        let id = port + ':' + suffix;
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
                suffix = SandboxStore.nextChar(suffix);
                id = port + ':' + suffix;
            }
        }
        return id;
    }

    fixturesOf(junctionId) {
        let fixturesOf = [];
        this.sandbox.fixtures.map((entry) => {
            if (entry.device === junctionId) {
                fixturesOf.push(entry.id);
            }
        });
        return fixturesOf;
    }

    @action addFixtureDeep(params) {
        let fixture = this.addFixture(params);
        let device = params.device;
        if (!this.junctionExists(device)) {
            this.addJunction(device);
            let lastDevice = this.lastDeviceExcept(device);
            if (lastDevice !== null) {
                let pipe = {
                    a: device,
                    z: lastDevice,
                    azBw: 0,
                    zaBw: 0
                };
                this.addPipe(pipe);
            }
        }
        return fixture;
    }

    @action deleteFixtureDeep(fixtureId) {
        let fixture = this.findFixture(fixtureId);

        this.deleteFixture(fixtureId);
        let device = fixture.device;

        if (this.fixturesOf(device).length === 0) {
            let connectedPipes = this.pipesConnectedTo(device);
            this.deleteJunction(device);
            connectedPipes.map((pipe) => {
                this.deletePipe(pipe.id);
            });
        }
    }

    @action deleteJunctionDeep(device) {
        this.fixturesOf(device).map((fixtureId) => {
            this.deleteFixture(fixtureId);
        });

        let connectedPipes = this.pipesConnectedTo(device);
        connectedPipes.map((pipe) => {
            this.deletePipe(pipe.id);
        });

        this.deleteJunction(device);
    }


    @action addFixture(params) {
        let id = this.makeFixtureId(params.port);

        let entry = {
            'id': id,
            'port': params.port,
            'device': params.device,
            'vlan': params.vlan,
            'vlanExpression': params.vlanExpression,
            'availableVlans': params.availableVlans,
            'ingress': params.ingress,
            'egress': params.egress,
            'label': id,
        };

        this.sandbox.fixtures.push(entry);
        return entry;
    }

    @action updateFixture(id, params) {
        // param keys: ingress, egress, label, vlan, vlanExpression
        this.sandbox.fixtures.map((entry) => {
            if (entry.id === id) {
                entry.ingress = params.ingress;
                entry.egress = params.egress;
                entry.vlanExpression = params.vlanExpression;
            }
        });
    }

    @action deleteFixture(id) {
        let idxToRemove = -1;
        this.sandbox.fixtures.map((entry, index) => {
            if (entry.id === id) {
                idxToRemove = index;
            }
        });
        if (idxToRemove > -1) {
            this.sandbox.fixtures.splice(idxToRemove, 1);
        }
    }

    @action setFixtureVlan(id, vlan) {
        this.sandbox.fixtures.map((entry) => {
            if (entry.id === id) {
                entry.vlan = vlan;
                entry.label = entry.port + ':' + vlan;
            }
        });
    }

    @action unsetFixtureVlan(id) {
        this.sandbox.fixtures.map((entry) => {
            if (entry.id === id) {
                entry.vlan = null;
                entry.label = entry.id;
            }
        });
    }

    lastDeviceExcept(device) {
        let lastDeviceAdded = null;
        this.sandbox.junctions.map((j) => {
            if (j.id !== device) {
                lastDeviceAdded = j.id;
            }
        });
        return lastDeviceAdded
    }

    junctionExists(device) {
        let junctionExists = false;
        this.sandbox.junctions.map((j) => {
            if (j.id === device) {
                junctionExists = true;
            }
        });
        return junctionExists;
    }

    @action addJunction(device) {
        this.sandbox.junctions.push({
            'id': device,
        });
    }

    @action deleteJunction(id) {
        let idxToRemove = -1;
        this.sandbox.junctions.map((entry, index) => {
            if (entry.id === id) {
                idxToRemove = index;
            }
        });
        this.sandbox.junctions.splice(idxToRemove, 1);
    }

    pipesConnectedTo(junctionId) {
        let connected = [];
        this.sandbox.pipes.map((entry) => {
            if (entry.a === junctionId || entry.z === junctionId) {
                connected.push(entry);
            }
        });
        return connected;
    }

    makePipeId(pipe) {
        return pipe.a + ' ' + pipe.z;
    }

    findPipe(id) {
        let result = null;
        this.sandbox.pipes.map((f) => {
            if (f.id === id) {
                result = f;
            }
        });
        return result;
    }

    @action addPipe(pipe) {
        pipe.id = this.makePipeId(pipe);

        this.sandbox.pipes.push(pipe);
        return pipe.id;
    }

    @action updatePipe(id, params) {
        this.sandbox.pipes.map((entry) => {
            if (entry.id === id) {
                entry.azBw = params.azBw;
                entry.zaBw = params.zaBw;
            }
        });
    }

    @action deletePipe(id) {
        let idxToRemove = -1;
        this.sandbox.pipes.map((entry, index) => {
            if (entry.id === id) {
                idxToRemove = index;
            }
        });
        if (idxToRemove > -1) {
            this.sandbox.pipes.splice(idxToRemove, 1);
        }
    }


}

export default new SandboxStore();