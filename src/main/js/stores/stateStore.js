import {observable, action} from 'mobx';

class StateStore {
    @observable connState = 'INITIAL';
    @observable errors = [];

    @action reset() {
        this.connState = 'INITIAL';
        this.clearErrors();
    }

    @action validate() {
        if (this.connState === 'INITIAL') {
            this.connState = 'VALIDATING';
        }
    }
    @action clearErrors() {
        this.errors = [];
    }

    @action postValidate(ok, errors) {
        if (ok) {
            this.connState = 'VALIDATE_OK';
        } else {
            this.errors = errors;
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

export default new StateStore();