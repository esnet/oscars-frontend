import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button, Grid, Row, Col} from 'react-bootstrap';

import {toJS, action, autorun, computed, whyRun} from 'mobx';

import VlanSelect from './vlanSelect';
import BwSelect from './bwSelect';
import picker from '../lib/picking';

const modalName = 'editFixture';

@inject('controlsStore', 'sandboxStore')
@observer
export default class EditFixtureModal extends Component {
    constructor(props) {
        super(props);
    }

    closeModal = () => {
        this.props.controlsStore.closeModal(modalName);
    };

    deleteFixture = () => {
        const ef = this.props.controlsStore.editFixture;
        if (ef.vlan !== null) {
            picker.releaseDeleted(ef.port, ef.vlan);
        }
        this.props.sandboxStore.deleteFixtureDeep(ef.fixtureId);
        this.closeModal();
    };


    render() {
        let showModal = this.props.controlsStore.modals.get(modalName);
        let ef = this.props.controlsStore.editFixture;

        let label = ef.device + ':' + ef.label;
        let vlan = ef.vlan + '';

        return (
            <div>
                <Modal bsSize='large' show={showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{label}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Grid fluid={true}>
                            <Row>
                                <Col md={6} sm={6}>
                                    <VlanSelect />
                                </Col>
                                <Col md={6} sm={6}>
                                    <BwSelect />
                                </Col>
                            </Row>
                            <Button bsStyle='warning' className='pull-right'
                                    onClick={this.deleteFixture}>Delete</Button>
                        </Grid>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}