import React, {Component} from 'react';
import {Modal, Panel, Button} from 'react-bootstrap';

import {observer, inject} from 'mobx-react';
import ConnectionDrawing from "./connectionDrawing";
import {toJS} from 'mobx';

const modalName = 'connection';

@inject('connsStore', 'modalStore')
@observer
export default class ConnectionModal extends Component {

    constructor(props) {
        super(props);
    }

    closeModal = () => {
        this.props.modalStore.closeModal(modalName);
    };


    render() {
        let showModal = this.props.modalStore.modals.get(modalName);
        if (!showModal) {
            return (<div />);
        }
        let conn = this.props.connsStore.store.current;

//        console.log(toJS(conn));

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
