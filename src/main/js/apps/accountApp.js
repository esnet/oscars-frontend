import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {toJS} from 'mobx';
import myClient from '../agents/client';
import EditUserForm from '../components/editUserForm';
import {size} from 'lodash'

@inject('userStore', 'commonStore')
@observer
export default class AccountApp extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.commonStore.setActiveNav('account');

        this.props.userStore.setParamsForEditUser({user: {}});
        myClient.submitWithToken('GET', '/protected/account', '')
            .then(
                (response) => {
                    let parsed = JSON.parse(response);
                    this.props.userStore.setParamsForEditUser({user: parsed});
                }
                ,
                (failResponse) => {
                    console.log('Error: ' + failResponse.status + ' - ' + failResponse.statusText);
                }
            );
    }


    submitUpdate = () => {
        let user = toJS(this.props.userStore.editUser.user);
        if (!size(user.username)) {
            console.log('username not set');
            return;
        }
        this.props.userStore.setParamsForEditUser({status: 'updating..'});

        myClient.submitWithToken('POST', '/protected/account', user)
            .then(
                (response) => {
                    let parsed = JSON.parse(response);
                    this.props.userStore.setParamsForEditUser({user: parsed, status: 'Updated!'});
                }
                ,
                (failResponse) => {
                    this.props.userStore.setParamsForEditUser({status: failResponse.statusText});
                    console.log('Error: ' + failResponse.status + ' - ' + failResponse.statusText);
                }
            );
    };


    submitPassword = (controlRef) => {
        let editUser = toJS(this.props.userStore.editUser);

        if (!size(editUser.password)) {
            console.log('password not set');
            return;
        }

        myClient.submitWithToken('POST', '/protected/account_password', editUser.password)
            .then(
                (response) => {
                }
                ,
                (failResponse) => {
                    console.log('Error: ' + failResponse.status + ' - ' + failResponse.statusText);
                }
            );
        // clear it
        this.props.userStore.setPassword('');
        controlRef.value = '';
    };

    render() {
        return <EditUserForm submitPassword={this.submitPassword}
                             submitUpdate={this.submitUpdate}
                             submitDelete={() => {}}
                             allowDelete={false} />
    }
}
