import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {
    Modal,
    Button,
    Panel,
    ListGroup,
} from 'react-bootstrap';

const modalName = 'displayErrors';

@inject('stateStore', 'controlsStore')
@observer
export default class DisplayErrorsModal extends Component {
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
                    <Modal.Title>Errors:</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Panel>
                        <ListGroup>{this.props.stateStore.st.errors}</ListGroup>
                    </Panel>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.closeModal}>Close</Button>
                </Modal.Footer>
            </Modal>

        );
    }
}