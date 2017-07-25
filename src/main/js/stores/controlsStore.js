import {observable, action} from 'mobx';

class ControlsStore {

    @observable connection = {
        connectionId: '',
        description: '',
        startAt: '',
        endAt: '',
        startAtInput: '',
        endAtInput: '',
        startAtReadable: '',
        endAtReadable: '',
        startAtValidation: 'success',
        endAtValidation: 'success',
        startAtValidationText: '',
        endAtValidationText: '',
        scheduleLocked: false,
    };

    @observable editFixture = {
        fixtureId: '',
        label: '',
        port: '',


        vlan: '',
        vlanChoice: '',
        vlanChoiceValidationState: '',
        vlanChoiceValidationText: '',
        vlanSelectionMode: '',

        showCopiedVlan: false,
        vlanLocked: false,
        vlanLockText: 'Lock',
        showVlanLockButton: false,

        copiedVlan: '',
        vlanCopyFromOptions: [],
        availableVlans: '',
        availableVlanRanges: [],
        baselineVlans: '',
        baselineVlanRanges: [],
        lockedVlans: '',

        ingress: 0,
        egress: 0,
        symmetrical: true,

        bwLocked: false,
        bwSelectionMode: '',
        bwSelectionModeOptions: [],
        showBwLockButton: true,
        baselineIngressBw: 0,
        baselineEgressBw: 0,
        availableIngressBw: 0,
        availableEgressBw: 0,
        ingressValidationState: '',
        ingressValidationText: '',
        egressValidationState: '',
        egressValidationText: '',
        lockedIngressBw: 0,
        lockedEgressBw: 0,

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
        lockedEro: false,
        ero: [],


    };

    @observable
    editUser = {
        allUsers: [],
        user: {},
        password: '',
        status: ''
    };

    @observable editDesign = {
        disabledSaveButton: true,
        designId: '',
        description: '',
        allDesigns: [],
    };



    @action setParamsForEditDesign(params) {
        Object.assign(this.editDesign, params);
    }

    @action clearEditDesign() {
        this.editDesign.designId = '';
        this.editDesign.description = '';
        this.editDesign.disabledSaveButton = true;
    }


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


    @action
    clearEditConnection() {
        this.connection.connectionId = '';
        this.connection.description = '';
    }


    @observable
    modals = observable.map({
        'editFixture': false,
        'editJunction': false,
        'editPipe': false,
        'addFixture': false,
        'designErrors': false,
        'connectionErrors': false,
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