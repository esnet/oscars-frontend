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
        status: ''
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
}
export default new UserStore();