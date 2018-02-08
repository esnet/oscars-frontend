import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {
    Modal,
    Button,
    Panel,
    ListGroup,
} from 'react-bootstrap';

const modalName = 'designErrors';

@inject('designStore', 'modalStore')
@observer
export default class DesignErrorsModal extends Component {
    constructor(props) {
        super(props);
    }

    closeModal = () => {
        this.props.modalStore.closeModal(modalName);
    };


    render() {
        let showModal = this.props.modalStore.modals.get(modalName);
        if (!showModal) {
            return null;
        }

        return (
            <Modal show={showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Design issues:</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Panel>
                        <Panel.Body>
                            <ListGroup>{this.props.designStore.design.errors}</ListGroup>
                        </Panel.Body>
                    </Panel>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.closeModal}>Close</Button>
                </Modal.Footer>
            </Modal>

        );
    }
}