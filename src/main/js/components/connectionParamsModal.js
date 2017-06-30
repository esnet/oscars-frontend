import React, {Component} from 'react';
import {observer, inject } from 'mobx-react';
import {Modal, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox , Grid, Row, Col} from 'react-bootstrap';


@inject('sandboxStore')
@observer
export default class ConnectionParamsModal extends Component {
    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
    }

    closeModal() {
        this.props.sandboxStore.closeModal('connection');
    }

    render() {
        let showModal = this.props.sandboxStore.modals.get('connection');

        return (
            <div>
                <Modal show={showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Connection parameters</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Shared connection parameters (date, time, etc)</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>


            </div>
        );
    }
}