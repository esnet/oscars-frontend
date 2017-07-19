import {observable, action} from 'mobx';

import {size} from 'lodash'
import myClient from '../agents/client'

class AccountStore {

    @observable loggedin = {
        username: '',
        token: '',
        admin: false,
    };

    @observable attempt = {
        username: '',
        password: '',
        error: ''
    };

    isLoggedIn() {
        return size(this.loggedin.username)
    }

    isAdmin() {
        return this.loggedin.admin;
    }


    @action clearAttempt() {
        this.attempt.username = '';
        this.attempt.password = '';
        this.attempt.error = '';
    }

    @action logout() {
        this.loggedin.username = '';
        this.loggedin.token = '';
        this.loggedin.admin = false;
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('admin');
    }

    @action setAttemptUsername(u) {
        this.attempt.username = u;
    }

    @action setAttemptPassword(p) {
        this.attempt.password = p;
    }

    @action setAttemptError(e) {
        this.attempt.error = e;
    }

    @action setLoggedinUsername(u) {
        this.loggedin.username = u;
        localStorage.setItem('username', u);
    }

    @action setLoggedinAdmin(a) {
        this.loggedin.admin = a;
        localStorage.setItem('admin', a);
    }

    @action setLoggedinToken(t) {
        this.loggedin.token = t;
        localStorage.setItem('token', t);
    }

    login() {
        let request = {username: this.attempt.username, password: this.attempt.password};
        return myClient.submit('POST', '/api/account/login', request)
            .then(
                (response) => {
                    this.setLoggedinUsername(this.attempt.username);
                    let parsed = JSON.parse(response);
                    this.setLoggedinAdmin(parsed.admin);
                    this.setLoggedinToken(parsed.token);

                },
                (failure) => {
                    console.log(failure);
                    this.setAttemptError(failure.statusText);
                }
            )
    }

}
export default new AccountStore();