import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button, ListGroup, ListGroupItem, Glyphicon} from 'react-bootstrap';
import transformer from '../lib/transform';

const modalName = 'addFixture';

@inject('topologyStore', 'controlsStore', 'sandboxStore')
@observer
export default class AddFixtureModal extends Component {
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
        };
        let fixture = this.props.sandboxStore.addFixtureDeep(params);

        const editFixtureParams = transformer.newFixtureToEditParams(fixture);
        this.props.controlsStore.setParamsForEditFixture(editFixtureParams);
        this.props.controlsStore.openModal('editFixture');
    };

    render() {
        const device = this.props.controlsStore.addFixture.device;
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
        );
    }
}

class DevicePortList extends Component {
    constructor(props) {
        super(props);
    }

    portSort = (a, b) => {
        if (a.port < b.port)
            return -1;
        if (a.port > b.port)
            return 1;
        return 0;
    };

    render() {
        let portsNodes = this.props.ports.sort(this.portSort).map((entry) => {
            let port = entry.port;
            let device = entry.device;
            let portLabel = port.split(':')[1];

            let clickHandler = () => {
                this.props.onAddClicked(device, port);
            };
            return (
                <ListGroupItem key={port} onClick={clickHandler}>{portLabel}
                    <Glyphicon className='pull-right' glyph='plus'/>
                </ListGroupItem>
            )

        });

        return <ListGroup>{portsNodes}</ListGroup>
    };
}


DevicePortList.propTypes = {
    onAddClicked: React.PropTypes.func.isRequired,
    ports: React.PropTypes.array.isRequired,
};
