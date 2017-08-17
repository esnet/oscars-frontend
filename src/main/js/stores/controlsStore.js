import {observable, action, toJS} from 'mobx';

import {merge, isArray, mergeWith} from 'lodash';

class ControlsStore {

    @observable connection = {
        connectionId: '',
        description: '',
        phase: '',
        schedule: {
            locked: false,
            acceptable: false,
            adviceText: '',
            start: {
                at: '',
                choice: '',
                readable: '',
                validationState: 'success',
                validationText: '',
            },
            end: {
                at: '',
                choice: '',
                readable: '',
                validationState: 'success',
                validationText: '',
            }
        },
        held: {
            until: '',
            remaining: '',
        },
        validation: {
            errors: [],
            acceptable: false,
        }
    };

    @observable
    editJunction = {
        junction: '',
        showAddPipeButton: '',
        otherJunction: '',
    };


    @observable editFixture = {
        fixtureId: '',
        label: '',
        port: '',

        locked: false,

        vlan: {
            vlanId: null,
            acceptable: false,
            adviceText: '',

            mode: '',
            modeOptions: [],
            typeIn: {
                choice: '',
                validationState: '',
                validationText: '',
            },
            copyFrom: {
                choice: '',
                options: [],
            },
            copied: {
                show: false,
                choice: '',
            },
            available: {
                lowest: '',
                expression: '',
                ranges: [],
            },
            baseline: {
                expression: '',
                ranges: [],
            },
        },
        bw: {
            ingress: 0,
            egress: 0,
            acceptable: false,
            adviceText: '',

            mode: '',
            modeOptions: [],
            baseline: {
                ingress: 0,
                egress: 0,
            },
            available: {
                ingress: 0,
                egress: 0,
            },

            typeIn: {
                symmetrical: true,
                ingress: {
                    choice: 0,
                    acceptable: false,
                    validationText: '',
                    validationState: 'error',
                },
                egress: {
                    choice: 0,
                    acceptable: false,
                    validationText: '',
                    validationState: 'error',
                },
            },

            copyFrom: {
                sameAsOptions: [],
                oppositeOfOptions: [],
                ingress: 0,
                egress: 0,
            },
            copied: {
                show: false,
                ingress: 0,
                egress: 0,
            }
        }
    };

    @observable
    editPipe = {
        a: '',
        z: '',
        pipeId: '',
        locked: false,
        loading: false,

        A_TO_Z: {
            bw: '',
            acceptable: false,
            validationText: '',
            validationState: 'error',
            available: 0,
            baseline: 0,
        },

        Z_TO_A: {
            bw: '',
            acceptable: false,
            validationText: '',
            validationState: 'error',
            available: 0,
            baseline: 0,
        },
        shortest: {
            ero: [],
            azBaseline: 0,
            zaBaseline: 0,
            zaAvailable: 0,
            azAvailable: 0,
        },
        fits: {
            ero: [],
            azBaseline: 0,
            zaBaseline: 0,
            zaAvailable: 0,
            azAvailable: 0,
        },
        manual: {
            ero: []
        },


        ero: {
            message: '',
            acceptable: false,
            validationText: '',
            validationState: 'error',
            hops: [],
            mode: 'shortest',
        },
    };



    customizer = (objValue, srcValue) => {
        if (isArray(srcValue)) {
            return srcValue;
        }
    }



    @action
    setParamsForEditPipe(params) {

        mergeWith(this.editPipe, params, this.customizer);
    }

    @action
    setParamsForEditJunction(params) {
        mergeWith(this.editJunction, params, this.customizer);
    }

    @action
    setParamsForEditFixture(params) {
        mergeWith(this.editFixture, params, this.customizer);
    }

    @action
    setParamsForConnection(params) {
        mergeWith(this.connection, params, this.customizer);
    }





    @action
    clearEditConnection() {
        this.connection.connectionId = '';
        this.connection.description = '';
    }



    // adding a fixture by selecting a device (through the map)

    @observable
    addFixture = {
        device: ''
    };

    @action
    setParamsForAddFixture(params) {
        merge(this.addFixture, params);
    }



    // Design editing

    @observable editDesign = {
        disabledSaveButton: true,
        designId: '',
        description: '',
        allDesigns: [],
    };

    @action setParamsForEditDesign(params) {
        merge(this.editDesign, params);
    }

    @action clearEditDesign() {
        this.editDesign.designId = '';
        this.editDesign.description = '';
        this.editDesign.disabledSaveButton = true;
    }




}

export default new ControlsStore();