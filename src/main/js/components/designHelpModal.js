import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {
    Modal,
    Button,
    Panel,
    ListGroup,
    ListGroupItem
} from 'react-bootstrap';

const modalName = 'designHelp';

@inject('designStore', 'modalStore')
@observer
export default class DesignHelpModal extends Component {
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
            <Modal bsSize='large' show={showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>OSCARS help</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Panel>
                        <h2>TL; DR</h2>
                        <ListGroup>
                            <ListGroupItem>Set a description, then optionally change the schedule,</ListGroupItem>
                            <ListGroupItem>Add one fixture, decide its VLAN and bandwidth and lock it,</ListGroupItem>
                            <ListGroupItem>Add at least one more fixture, and lock it,</ListGroupItem>
                            <ListGroupItem>Click on any pipes, set their parameters, and lock them,</ListGroupItem>
                            <ListGroupItem>Click "Commit"</ListGroupItem>
                        </ListGroup>
                        <h2>Introduction</h2>
                        <p>OSCARS is a system that automatically manages virtual circuits.</p>
                        <p><i><b>Todo: write more help</b></i></p>
                        <h2>Concepts</h2>
                        <h3>Fixtures, junctions and pipes</h3>
                        <p>We have taken these concepts from plumbing language - feedback is welcome</p>
                        <p>Fixtures in plumbing are things such as sinks, faucets, etc - points where
                            fluids enter or exit the system. We use "fixture" to represent the points where
                            packets enter and exit our connection. The type of fixture we support currently
                            represents a VLAN on a physical Ethernet port.</p>
                        <p>Pipes connect things; anything that comes in on one end comes out the other. In our case
                            pipes represent MPLS LSPs across our network from one device to another.</p>
                        <p>Junctions are where things interconnect. In our case, a junction represents a
                            physical device where our pipes and/or fixtures are interconnected. </p>

                    </Panel>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.closeModal}>Close</Button>
                </Modal.Footer>
            </Modal>

        );
    }
}