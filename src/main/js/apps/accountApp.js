import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {toJS} from 'mobx';
import myClient from '../agents/client';
import EditUserForm from '../components/editUserForm';
import {size} from 'lodash'

@inject('controlsStore')
@observer
export default class AccountApp extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        myClient.submitWithToken('GET', '/protected/account', '')
            .then(
                (response) => {
                    let parsed = JSON.parse(response);
                    this.props.controlsStore.setParamsForEditUser({user: parsed});
                }
                ,
                (failResponse) => {
                    console.log('Error: ' + failResponse.status + ' - ' + failResponse.statusText);
                }
            );
    }


    submitUpdate = () => {
        let user = toJS(this.props.controlsStore.editUser.user);
        if (!size(user.username)) {
            console.log('username not set');
            return;
        }

        myClient.submitWithToken('POST', '/protected/account', user)
            .then(
                (response) => {
                    let parsed = JSON.parse(response);
                    this.props.controlsStore.setParamsForEditUser({user: parsed});
                }
                ,
                (failResponse) => {
                    console.log('Error: ' + failResponse.status + ' - ' + failResponse.statusText);
                }
            );
    };


    submitPassword = (controlRef) => {
        let editUser = toJS(this.props.controlsStore.editUser);

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
        this.props.controlsStore.setPassword('');
        controlRef.value = '';
    };

    render() {
        return <EditUserForm submitPassword={this.submitPassword}
                             submitUpdate={this.submitUpdate}
                             submitDelete={() => {}}
                             allowDelete={false} />
    }
}
