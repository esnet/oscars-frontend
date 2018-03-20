import React, {Component} from 'react';

import {action, toJS} from 'mobx';
import {inject} from 'mobx-react';

import myClient from '../agents/client';
import {Button, Modal, ModalFooter, ModalHeader, ModalBody} from 'reactstrap';
import {withRouter} from 'react-router-dom'

@inject('controlsStore', 'designStore')
class CommitButton extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.setState({
            confirmOpen: false
        });
    }

    toggleConfirm = () => {
        this.setState({
            confirmOpen: !this.state.confirmOpen
        });
    };


    commit = () => {

        myClient.submitWithToken('POST', '/protected/conn/commit', this.props.controlsStore.connection.connectionId)
            .then(action((response) => {
                const phase = response.replace(/"/g, '');
                this.props.controlsStore.setParamsForConnection({
                    phase: phase
                });
                // TODO: do some checking of response!

                this.props.controlsStore.clearEditConnection();
                this.props.controlsStore.clearEditDesign();
                this.props.designStore.clear();
                this.props.controlsStore.clearSessionStorage();
                this.props.designStore.clearSessionStorage();

                this.props.history.push('/pages/list');

            }));

        return false;
    };


    render() {
        return <div>
            <Modal isOpen={this.state.confirmOpen} toggle={this.toggleConfirm}>
                <ModalHeader toggle={this.toggleConfirm}>Commit connection</ModalHeader>
                <ModalBody>
                    Are you ready to commit this reservation?
                </ModalBody>
                <ModalFooter>
                    <Button color='primary' onClick={this.commit}>Commit</Button>{' '}
                    <Button color='secondary' onClick={this.toggleConfirm}>Never mind</Button>
                </ModalFooter>
            </Modal>
            {' '}
            <Button color='success' onClick={this.toggleConfirm}>Commit</Button>
        </div>;


    }
}

export default withRouter(CommitButton);

