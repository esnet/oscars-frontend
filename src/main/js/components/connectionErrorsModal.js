import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {
    Modal,
    Button,
    Panel,
    ListGroup,
    ListGroupItem
} from 'reactstrap';

const modalName = 'connectionErrors';

@inject('controlsStore', 'modalStore')
@observer
export default class ConnectionErrorsModal extends Component {
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
                    <Modal.Title>Connection parameter errors:</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Panel>
                        <Panel.Body>
                            <ListGroup>
                                {
                                    this.props.controlsStore.connection.validation.errors.map((e, idx) => {
                                        return <ListGroupItem key={idx}>{e}</ListGroupItem>;
                                    })
                                }
                            </ListGroup>
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