import {observable, action} from 'mobx';

class StateStore {
    @observable st = {
        connState: 'INITIAL',
        errors: [],
    }


    @action validate() {
        if (this.st.connState === 'INITIAL') {
            this.st.connState = 'VALIDATING';
        }
    }

    @action postValidate(ok, errors) {
        this.st.errors = errors;
        if (ok) {
            this.st.connState = 'VALIDATE_OK';
        } else {
            this.st.connState = 'INITIAL';
        }
    }

    @action check() {
        if (this.st.connState === 'INITIAL') {
            this.st.connState = 'CHECKING';
        }
    }

    @action postCheck(ok) {
        if (ok) {
            this.st.connState = 'CHECK_OK';
        } else {
            this.st.connState = 'INITIAL';
        }
    }

    @action hold() {
        if (this.st.connState === 'CHECK_OK') {
            this.st.connState = 'HOLDING';
        }
    }

    @action postHold(ok) {
        if (ok) {
            this.st.connState = 'HOLD_OK';
        } else {
            this.st.connState = 'INITIAL';
        }
    }

    @action release() {
        if (this.st.connState === 'HOLD_OK') {
            this.st.connState = 'RELEASING';
        }
    }

    @action postRelease() {
        if (this.st.connState === 'RELEASING') {
            this.st.connState = 'CHECK_OK';
        }
    }

    @action commit() {
        if (this.st.connState === 'HOLD_OK') {
            this.st.connState = 'COMMITTING';
        }
    }

    @action postCommit(ok) {
        if (ok) {
            this.st.connState = 'COMMITTED';
        } else {
            this.st.connState = 'INITIAL';
        }
    }


}

export default new StateStore();