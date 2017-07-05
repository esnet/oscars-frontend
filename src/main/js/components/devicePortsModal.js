import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button, ListGroup, ListGroupItem, Glyphicon} from 'react-bootstrap';

const modalName = 'devicePorts';

@inject('topologyStore', 'controlsStore', 'sandboxStore')
@observer
export default class DevicePortsModal extends Component {
    componentWillMount() {
        this.props.topologyStore.loadAvailablePorts();
    }

    closeModal = () => {
        this.props.controlsStore.closeModal(modalName);
    };

    addFixture = (device, port) => {
        let params = {
            device: device,
            port: port,
            ingress: 0,
            egress: 0,
            vlan: null,
            vlanExpression: '',
            availableVlans: ''
        };
        let fixture = this.props.sandboxStore.addFixtureDeep(params);
        this.props.controlsStore.selectFixture(fixture);
        this.props.controlsStore.openModal('editFixture');
    };

    render() {
        const device = this.props.controlsStore.selection.device;
        const devicePorts = this.props.topologyStore.availPortsByDevice;

        let ports = [];
        if (typeof device !== 'undefined' && device !== '' && device !== null) {
            devicePorts.get(device).map((port) => {
                    ports.push({
                        'port': port,
                        'device': device
                    })
                }
            );
        }

        let showModal = this.props.controlsStore.modals.get(modalName);
        return (
            <div>
                <Modal show={showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{device}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <DevicePortList ports={ports} onAddClicked={this.addFixture}/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

class DevicePortList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let portsNodes = this.props.ports.map((entry) => {
            let port = entry.port;
            let device = entry.device;
            let clickHandler = () => {
                this.props.onAddClicked(device, port);
            };
            return (
                <ListGroupItem key={port}>{port}
                    <Glyphicon onClick={clickHandler} className='pull-right' glyph='plus'/>
                </ListGroupItem>
            )

        });

        return <ListGroup>{portsNodes}</ListGroup>
    };
};

