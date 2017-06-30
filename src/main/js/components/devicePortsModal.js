import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button} from 'react-bootstrap';
import DevicePortList from './devicePorts';


@inject('sandboxStore', 'topologyStore')
@observer
export default class DevicePortsModal extends Component {
    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
    }

    closeModal() {
        this.props.sandboxStore.closeModal('device');
    }

    render() {
        const device = this.props.sandboxStore.selection.device;
        const devicePorts = this.props.topologyStore.availPortsByDevice;

        let ports = [];
        if (typeof device !== 'undefined' && device !== '') {
            devicePorts.get(device).map((port) => {
                    ports.push({
                        'port': port,
                        'device': device
                    })
                }
            );
        }

        let showModal = this.props.sandboxStore.modals.get('device');

        return (
            <div>
                <Modal show={showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{device}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <DevicePortList ports={ports} />

                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>


            </div>
        );
    }
}