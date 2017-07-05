import {observable, action} from 'mobx';

class ControlsStore {

    @observable selection = {
        connectionId: '',

        device: '',

        pipe: '',
        azBw: 0,
        zaBw: 0,

        junction: '',

        startAt: '',
        endAt: '',


    };

    @observable fixture = {
        vlanExpression: '',
        vlan: null,
        availableVlans: '',
        ingress: 0,
        egress: 0,
        device: '',
        port: '',
        label: '',
        id: ''
    };


    @observable disabledControls = {};


    @observable modals = observable.map({
        'editFixture': false,
        'editJunction': false,
        'editPipe': false,
        'devicePorts': false
    });

    @action setConnectionId(connId) {
        this.selection.connectionId = connId;
    }


    @action disableControl(name) {
        this.disabledControls[name] = true;
    }
    @action enableControl(name) {
        this.disabledControls[name] = false;
    }


    @action setStartAt(date) {
        this.selection.startAt = date;
    }

    @action setEndAt(date) {
        this.selection.endAt = date;
    }

    @action openModal(type) {
        this.closeModals();
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
    }

    @action selectDevice(device) {
        this.selection.device = device;
    }

    @action selectPipe(id) {
        this.selection.pipe = id;
    }

    @action setAzBw(bw) {
        this.selection.azBw = bw;
    }

    @action setZaBw(bw) {
        this.selection.zaBw = bw;
    }




    @action selectFixture(fixture) {
        this.fixture = fixture;
    }

    @action setAvailableVlans(vlans) {
        this.fixture.availableVlans = vlans;
    }

    @action setVlanExpression(expression) {
        this.fixture.vlanExpression = expression;
    }
    @action setVlan(vlan) {
        this.fixture.vlan = vlan;
    }


    @action setIngress(value) {
        this.fixture.ingress = value;
    }

    @action setEgress(value) {
        this.fixture.egress = value;
    }


}

export default new ControlsStore();