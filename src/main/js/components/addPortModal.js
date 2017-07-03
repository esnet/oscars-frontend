import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button} from 'react-bootstrap';
import FixtureParamsForm from './fixtureParamsForm';


@inject('sandboxStore')
@observer
export default class AddPortModal extends Component {
    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
    }

    closeModal() {
        this.props.sandboxStore.closeModal('port');
    }


    render() {
        let port = this.props.sandboxStore.selection.port;
        let device = this.props.sandboxStore.selection.device;
        let showModal = this.props.sandboxStore.modals.get('port');


        return (
            <div>
                <Modal show={showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{port} ({device})</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <FixtureParamsForm modal='port'/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>


            </div>
        );
    }
}