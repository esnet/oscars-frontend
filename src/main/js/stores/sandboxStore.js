import { observable, action } from 'mobx';

class SandboxStore {
    @observable sandbox = {
        junctions: [],
        fixtures: [],
        pipes: [],
    };

    @observable selection = {
        device: "",
        fixture: "",
    };

    @observable connState = "INITIAL";

    @observable modals = {
        "fixture": false,
        "device": false
    };


    @action addFixture(urn) {
        this.sandbox.fixtures.push(urn);
    }

    @action deleteFixture(urn) {
        const index = this.sandbox.fixtures.indexOf(urn);
        if (index > -1) {
            this.sandbox.fixtures.splice(index, 1);
        }
    }

    @action openModal(type) {
        this.modals[type] = true;
    }
    @action closeModal(type) {
        this.modals[type] = false;
    }

    @action selectDevice(urn) {
        this.selection.device = urn;
        this.openModal('device');
    }

    @action selectFixture(urn) {
        this.selection.fixture = urn;
        this.closeModal('device');
        this.openModal('fixture');
    }




    @action reset() {
        this.connState = "INITIAL";
    }

    @action check() {
        if (this.connState === "INITIAL") {
            this.connState = "CHECKING";
        }
    }

    @action postCheck(ok) {
        if (ok) {
            this.connState = "CHECK_OK";
        } else {
            this.connState = "INITIAL";
        }
    }
    @action hold() {
        if (this.connState === "CHECK_OK") {
            this.connState = "HOLDING";
        }
    }
    @action postHold(ok) {
        if (ok) {
            this.connState = "HOLD_OK";
        } else {
            this.connState = "INITIAL";
        }
    }
    @action commit() {
        if (this.connState === "HOLD_OK") {
            this.connState = "COMMITTING";
        }
    }
    @action postCommit(ok) {
        if (ok) {
            this.connState = "COMMITTED";
        } else {
            this.connState = "INITIAL";
        }
    }


}

export default new SandboxStore();