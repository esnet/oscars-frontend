import {observable, action} from 'mobx';

import {size} from 'lodash';

class UserStore {

    @observable
    editUser = {
        allUsers: [],
        user: {},
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