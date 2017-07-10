import React, {Component} from 'react';
import {Modal, Button} from 'react-bootstrap';

import {observer, inject} from 'mobx-react';

const modalName = 'connection';

@inject('controlsStore', 'connsStore')
@observer
export default class ConnectionModal extends Component {

    constructor(props) {
        super(props);
    }

    closeModal = () => {
        this.props.controlsStore.closeModal(modalName);
    };


    render() {
        let showModal = this.props.controlsStore.modals.get(modalName);
        if (!showModal) {
            return(<div />);
        }
        let conn = this.props.connsStore.store.current;


        return (
            <Modal bsSize='large' show={showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{conn.connectionId}</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.closeModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
