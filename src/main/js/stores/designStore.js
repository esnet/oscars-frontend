import {observable, action} from 'mobx';

class DesignStore {

    /*
    junction: { id: Device URN }
    fixture: {
            id: some id,
            port: port URN,
            device: device URN,
            label: a label
            vlan: int,
            ingress: int,
            egress: int,
            bwPreviouslySet: bool,
    }
    pipe: {
           id: some id,
           azBw: int
           zaBW: int,
           bwPreviouslySet: bool,
           ero: []
    }



     */


    @observable design = {
        junctions: [],
        fixtures: [],
        pipes: [],
        errors: [],
    };


    findFixture(id) {
        let result = null;
        this.design.fixtures.map((f) => {
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
            this.design.fixtures.map((e) => {
                if (e.id === id) {
                    idIsTaken = true;
                }
            });
            if (!idIsTaken) {
                idMightBeTaken = false;
            } else {
                suffix = DesignStore.nextChar(suffix);
                id = port + ':' + suffix;
            }
        }
        return {id: id, suffix: suffix};
    }

    fixturesOf(junctionId) {
        let fixturesOf = [];
        this.design.fixtures.map((entry) => {
            if (entry.device === junctionId) {
                fixturesOf.push(entry.id);
            }
        });
        return fixturesOf;
    }

    deviceOf(fixtureId) {
        return this.findFixture(fixtureId).device;
    }

    @action
    setComponents(cmp) {
        this.design.junctions = cmp.junctions;
        this.design.fixtures = cmp.fixtures;
        this.design.pipes = cmp.pipes;

    }



    @action
    clear() {
        this.design.junctions = [];
        this.design.fixtures = [];
        this.design.pipes = [];
        this.design.errors = [];
    }

    @action
    setErrors(errs) {
        this.design.errors = errs;
    }

    @action
    addFixtureDeep(params) {
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
                    zaBw: 0,
                    ero: []
                };
                this.addPipe(pipe);
            }
        }
        return fixture;
    }

    @action
    deleteFixtureDeep(fixtureId) {
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

    @action
    deleteJunctionDeep(device) {
        this.fixturesOf(device).map((fixtureId) => {
            this.deleteFixture(fixtureId);
        });

        let connectedPipes = this.pipesConnectedTo(device);
        connectedPipes.map((pipe) => {
            this.deletePipe(pipe.id);
        });

        this.deleteJunction(device);
    }


    @action
    addFixture(params) {
        let idResult = this.makeFixtureId(params.port);

        let label = params.port.split(':')[1] + ':' + idResult.suffix;
        let entry = {
            id: idResult.id,
            port: params.port,
            device: params.device,
            label: label,
            vlan: null,
            ingress: 0,
            egress: 0,
            bwPreviouslySet: false,

        };


        this.design.fixtures.push(entry);
        return entry;
    }

    @action
    setFixtureBandwidth(id, params) {
        this.design.fixtures.map((entry) => {
            if (entry.id === id) {
                entry.ingress = params.ingress;
                entry.egress = params.egress;
                entry.bwPreviouslySet = true;
            }
        });
    }

    @action
    unsetFixtureBandwidth(id) {
        this.design.fixtures.map((entry) => {
            if (entry.id === id) {
                entry.bwPreviouslySet = false;
                entry.bwSelectMode = 'typeIn';

            }
        });

    }

    @action
    deleteFixture(id) {
        let idxToRemove = -1;
        this.design.fixtures.map((entry, index) => {
            if (entry.id === id) {
                idxToRemove = index;
            }
        });
        if (idxToRemove > -1) {
            this.design.fixtures.splice(idxToRemove, 1);
        }
    }

    @action
    setFixtureVlan(id, vlan) {

        let outLabel = null;
        this.design.fixtures.map((entry) => {
            if (entry.id === id) {
                const label = entry.port.split(':')[1] + ':' + vlan;

                entry.vlan = vlan;
                entry.label = label;
                outLabel = label;
            }
        });
        return outLabel;
    }

    @action
    unsetFixtureVlan(id) {
        let outLabel = null;

        this.design.fixtures.map((entry) => {
            if (entry.id === id) {
                const label = entry.port.split(':')[1] + ':' + entry.id.split(':')[2];

                entry.vlan = null;
                entry.label = label;


                outLabel = label;

            }
        });
        return outLabel;

    }

    lastDeviceExcept(device) {
        let lastDeviceAdded = null;
        this.design.junctions.map((j) => {
            if (j.id !== device) {
                lastDeviceAdded = j.id;
            }
        });
        return lastDeviceAdded
    }

    junctionExists(device) {
        let junctionExists = false;
        this.design.junctions.map((j) => {
            if (j.id === device) {
                junctionExists = true;
            }
        });
        return junctionExists;
    }

    @action
    addJunction(device) {
        this.design.junctions.push({
            'id': device,
        });
    }

    @action
    deleteJunction(id) {
        let idxToRemove = -1;
        this.design.junctions.map((entry, index) => {
            if (entry.id === id) {
                idxToRemove = index;
            }
        });
        this.design.junctions.splice(idxToRemove, 1);
    }

    pipesConnectedTo(junctionId) {
        let connected = [];
        this.design.pipes.map((entry) => {
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
        this.design.pipes.map((f) => {
            if (f.id === id) {
                result = f;
            }
        });
        return result;
    }

    @action
    addPipe(pipe) {
        pipe.id = this.makePipeId(pipe);
        pipe.bwPreviouslySet = false;

        this.design.pipes.push(pipe);
        return pipe.id;
    }

    @action
    updatePipe(id, params) {
        this.design.pipes.map((pipe) => {
            if (pipe.id === id) {
                Object.assign(pipe, params);
            }
        });
    }

    @action
    deletePipe(id) {
        let idxToRemove = -1;
        this.design.pipes.map((entry, index) => {
            if (entry.id === id) {
                idxToRemove = index;
            }
        });
        if (idxToRemove > -1) {
            this.design.pipes.splice(idxToRemove, 1);
        }
    }



}

export default new DesignStore();