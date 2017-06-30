import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button} from 'react-bootstrap';
import FixtureList from "./fixtures";


@inject('sandboxStore', 'topologyStore')
@observer
export default class FixtureParamsModal extends Component {
    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
    }

    closeModal() {
        this.props.sandboxStore.closeModal('device');
    }

    render() {
        const device = this.props.sandboxStore.selection.device;

        const devicePorts = this.props.topologyStore.portsForFixtures[device];
        let showModal = this.props.sandboxStore.modals['device'];

        return (
            <div>
                <Modal show={showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{device}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <FixtureList fixtures={devicePorts} onFixtureClick={() => {
                        }}/>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>


            </div>
        );
    }
}