import {observable, action} from 'mobx';


class UserStore {

    @observable
    editUser = {
        allUsers: [],
        user: {
            permissions: {
                adminAllowed: false,
            }
        },
        password: '',
        passwordAgain: '',
        passwordOk: false,
        passwordValidationState: 'error',
        passwordHelpText: 'Password too short',
        status: '',
        changingPwd: false
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
    @action setPasswordAgain(value) {
        this.editUser.passwordAgain = value;
    }
}
export default new UserStore();