import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import DevicePortList from './devicePortList';
import {
    Modal,
    Button,
    Glyphicon,
    Popover,
    OverlayTrigger,
} from 'react-bootstrap';

import transformer from '../lib/transform';

const modalName = 'addFixture';

@inject('topologyStore', 'controlsStore', 'designStore', 'mapStore', 'modalStore')
@observer
export default class AddFixtureModal extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.topologyStore.loadEthernetPorts();
        this.props.topologyStore.loadBaseline();
    }

    closeModal = () => {
        this.props.modalStore.closeModal(modalName);
    };

    addFixture = (device, port) => {
        let params = {
            device: device,
            port: port.urn,
        };
        let fixture = this.props.designStore.addFixtureDeep(params);

        const editFixtureParams = transformer.newFixtureToEditParams(fixture);
        this.props.controlsStore.setParamsForEditFixture(editFixtureParams);
        this.props.mapStore.addColoredNode({id: device, color: 'green'});
        this.props.mapStore.setZoomOnColored(true);

        this.props.modalStore.openModal('editFixture');
    };

    render() {
        const device = this.props.controlsStore.addFixture.device;
        const devicePorts = this.props.topologyStore.ethPortsByDevice;

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
        const help = <Popover id='help-addFixtureModal' title='Fixture selection'>
            <p>Here you can see all the physical ports on the selected device that you
                can use for fixtures.</p>
            <p>You can click on the port name to expand details.</p>
            <p>Click on the plus sign to close this form, add a fixture on that port, and start editing it.</p>
        </Popover>;

        const questionmark = <OverlayTrigger trigger='click' rootClose placement='left' overlay={help}>
            <Glyphicon className='pull-right' glyph='question-sign'/>
        </OverlayTrigger>;


        let showModal = this.props.modalStore.modals.get(modalName);
        return (
            <Modal show={showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{device} {questionmark} </Modal.Title>
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
