import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    Card,
    CardBody,
    ListGroup,
    ListGroupItem
} from "reactstrap";

const modalName = "designHelp";

@inject("designStore", "modalStore")
@observer
class DesignHelpModal extends Component {
    constructor(props) {
        super(props);
    }

    closeModal = () => {
        this.props.modalStore.closeModal(modalName);
    };

    toggle = () => {
        if (this.props.modalStore.modals.get(modalName)) {
            this.props.modalStore.closeModal(modalName);
        } else {
            this.props.modalStore.openModal(modalName);
        }
    };

    render() {
        let showModal = this.props.modalStore.modals.get(modalName);
        if (!showModal) {
            return null;
        }

        return (
            <Modal
                size="lg"
                fade={false}
                isOpen={showModal}
                toggle={this.toggle}
                onExit={this.closeModal}
            >
                <ModalHeader toggle={this.toggle}>OSCARS help</ModalHeader>
                <ModalBody>
                    <Card>
                        <CardBody>
                            <h3>Quick guide</h3>
                            <ListGroup>
                                <ListGroupItem>
                                    Set a description for your connection,
                                </ListGroupItem>
                                <ListGroupItem>
                                    Unlock, change, then re-lock the schedule,
                                </ListGroupItem>
                                <ListGroupItem>
                                    Add a fixture, decide its VLAN and bandwidth and lock it,
                                </ListGroupItem>
                                <ListGroupItem>
                                    Add at least one more fixture, and lock it
                                </ListGroupItem>
                                <ListGroupItem>Keep adding fixtures as needed.</ListGroupItem>
                                <ListGroupItem>
                                    Verify pipe topology; click on junction to add more pipes
                                </ListGroupItem>
                                <ListGroupItem>
                                    Click on each pipe, set parameters, and lock,
                                </ListGroupItem>
                                <ListGroupItem>Finally, click "Commit"</ListGroupItem>
                            </ListGroup>
                        </CardBody>
                    </Card>
                </ModalBody>
            </Modal>
        );
    }
}

export default DesignHelpModal;
