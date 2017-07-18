import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {
    Modal,
    Button,
    Panel,
    ListGroup,
} from 'react-bootstrap';

const modalName = 'designErrors';

@inject('designStore', 'controlsStore')
@observer
export default class DesignErrorsModal extends Component {
    constructor(props) {
        super(props);
    }

    closeModal = () => {
        this.props.controlsStore.closeModal(modalName);
    };


    render() {
        let showModal = this.props.controlsStore.modals.get(modalName);

        return (
            <Modal show={showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Design issues:</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Panel>
                        <ListGroup>{this.props.designStore.design.errors}</ListGroup>
                    </Panel>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.closeModal}>Close</Button>
                </Modal.Footer>
            </Modal>

        );
    }
}