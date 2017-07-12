import {observable, action} from 'mobx';

class ControlsStore {

    @observable connection = {
        connectionId: '',
        description: '',
        startAt: '',
        endAt: '',
        startAtInput: '',
        endAtInput: '',
        startAtValidation: 'success',
        endAtValidation: 'success',
        startAtValidationText: '',
        endAtValidationText: ''
    };

    @observable editFixture = {
        fixtureId: '',
        label: '',
        port: '',

        vlan: '',
        availableVlans: '',
        availableVlanRanges: [],
        vlanExpression: '',

        vlanSelectionMode: '',
        vlanCopyFromOptions: [],

        copiedVlan: '',
        showCopiedVlan: false,

        showVlanPickButton: false,
        showVlanPickControls: false,
        showVlanReleaseControls: false,
        retrievingAvailVlans: false,


        ingress: 0,
        egress: 0,
        symmetrical: true,

        bwBeingEdited: false,
        bwPreviouslySet: false,
        bwSelectionMode: '',
        bwSelectionModeOptions: [],
        showBwSetButton: true,

        showCopiedBw: false,
        copiedIngress: 0,
        copiedEgress: 0,
        bwCopyFromOptions: [],
    }
    ;
    @observable
    addFixture = {
        device: ''
    };
    @observable
    editJunction = {
        junction: '',
        showAddPipeButton: '',
        azBw: '',
        zaBw: '',
        otherJunction: '',
    };
    @observable
    editPipe = {
        pipeId: '',
        azBw: '',
        zaBw: '',
        showUpdateButton: false,

    };

    @observable
    editUser = {
        allUsers: [],
        user: {},
        password: ''
    };


    @action
    setParamsForEditUser(params) {
        Object.assign(this.editUser, params);
    }

    @action
    setParamsForOneUser(params) {
        Object.assign(this.editUser.user, params);
    }
    @action setPassword(value) {
        this.editUser.password = value;
    }




    @action
    setParamsForEditPipe(params) {
        Object.assign(this.editPipe, params);
    }

    @action
    setParamsForEditJunction(params) {
        Object.assign(this.editJunction, params);
    }

    @action
    setParamsForEditFixture(params) {
        Object.assign(this.editFixture, params);
    }

    @action
    setParamsForAddFixture(params) {
        Object.assign(this.addFixture, params);
    }

    @action
    setParamsForConnection(params) {
        Object.assign(this.connection, params);
    }

    @observable
    modals = observable.map({
        'editFixture': false,
        'editJunction': false,
        'editPipe': false,
        'addFixture': false,
        'displayErrors': false,
        'connection': false,
        'userAdmin': false,
    });


    @action
    openModal(type) {
        this.closeModals();
        this.modals.set(type, true);
    }

    @action
    closeModal(type) {
        this.modals.set(type, false);
    }

    @action
    closeModals() {
        this.modals.forEach((value, key) => {
            this.modals.set(key, false);
        });
    }


}

export default new ControlsStore();