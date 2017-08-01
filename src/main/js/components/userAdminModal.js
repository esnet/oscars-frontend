import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button} from 'react-bootstrap';
import EditUserForm from './editUserForm';
import myClient from '../agents/client';
import {size} from 'lodash'

const modalName = 'userAdmin';

@inject('modalStore', 'userStore')
@observer
export default class UserAdminModal extends Component {
    constructor(props) {
        super(props);
    }


    submitPassword = (controlRef) => {
        let password = this.props.userStore.editUser.password;
        let user = this.props.userStore.editUser.user;

        if (!size(password)) {
            console.log('password not set');
            return;
        }
        // set the password
        myClient.submitWithToken('POST', '/admin/users/' + user.username + '/password', password + '')
            .then(
                (response) => {
                    this.props.refresh();
                }
                ,
                (failResponse) => {
                    console.log('Error: ' + failResponse.status + ' - ' + failResponse.statusText);
                }
            );
        // clear UI after setting
        this.props.userStore.setPassword('');
        controlRef.value = '';
    };

    submitUpdate = () => {
        let user = this.props.userStore.editUser.user;
        // update the user
        myClient.submitWithToken('POST', '/admin/users/' + user.username, user)
            .then(
                (response) => {
                    let parsed = JSON.parse(response);
                    this.props.userStore.setParamsForEditUser({user: parsed});
                    this.props.refresh();
                }
                ,
                (failResponse) => {
                    console.log('Error: ' + failResponse.status + ' - ' + failResponse.statusText);
                }
            );
    };

    submitDelete = () => {
        let user = this.props.userStore.editUser.user;
        let allUsers = this.props.userStore.editUser.allUsers;
        if (size(allUsers <= 1)) {
            console.log('will not delete last user');
            return;
        }
        myClient.submitWithToken('DELETE', '/admin/users/' + user.username, '')
            .then(
                (response) => {
                    // delete
                    this.props.refresh();
                    this.closeModal();
                }
                ,
                (failResponse) => {
                    console.log('Error: ' + failResponse.status + ' - ' + failResponse.statusText);
                }
            );

    };


    closeModal = () => {
        this.props.modalStore.closeModal(modalName);
    };

    render() {
        let showModal = this.props.modalStore.modals.get(modalName);

        return (
            <Modal show={showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>User administration</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <EditUserForm submitPassword={this.submitPassword}
                                  submitUpdate={this.submitUpdate}
                                  submitDelete={this.submitDelete}
                                  allowDelete={true}
                    />


                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.closeModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}