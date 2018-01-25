import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button, Grid, Row, Col} from 'react-bootstrap';

import {toJS, action, autorun, computed, whyRun} from 'mobx';
import ToggleDisplay from 'react-toggle-display';

import VlanSelect from './vlanSelect';
import BwSelect from './bwSelect';

const modalName = 'editFixture';

@inject('controlsStore', 'designStore', 'mapStore', 'modalStore')
@observer
export default class EditFixtureModal extends Component {
    constructor(props) {
        super(props);
    }

    closeModal = () => {
        this.props.modalStore.closeModal(modalName);
    };

    deleteFixture = () => {
        const ef = this.props.controlsStore.editFixture;

        let device = this.props.designStore.deviceOf(ef.fixtureId);

        this.props.designStore.deleteFixtureDeep(ef.fixtureId);

        // check if the junction is completely gone; if so, uncolor the map
        if (!this.props.designStore.junctionExists(device)) {
            this.props.mapStore.deleteColoredNode(device);
        }
        this.closeModal();
    };

    lockFixture = () => {
        const ef = this.props.controlsStore.editFixture;
        let eParams = {locked: true};
        let tParams = {locked: true};

        tParams.ingress = ef.bw.ingress.mbps;
        tParams.egress = ef.bw.egress.mbps;


        tParams.vlan = ef.vlan.vlanId;

        eParams.label = this.props.designStore.lockFixture(ef.fixtureId, tParams);


        this.props.controlsStore.setParamsForEditFixture(eParams);
    };

    unlockFixture = () => {
        const ef = this.props.controlsStore.editFixture;

        const label = this.props.designStore.unlockFixture(ef.fixtureId);
        this.props.controlsStore.setParamsForEditFixture({label: label, locked: false});

    };

    render() {
        let showModal = this.props.modalStore.modals.get(modalName);
        let conn = this.props.controlsStore.connection;
        let ef = this.props.controlsStore.editFixture;


        let title = ef.device + ':'+ ef.label;
        const disableLockBtn = !ef.vlan.acceptable || !ef.bw.acceptable;

        return (
            <Modal bsSize='large' show={showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ToggleDisplay show={conn.schedule.locked}>
                        <Grid fluid={true}>
                            <Row>
                                <Col md={5} sm={5} lg={5}>
                                    <VlanSelect />
                                </Col>
                                <Col md={7} sm={7} lg={7}>
                                    <BwSelect />
                                </Col>
                            </Row>
                            <Button bsStyle='warning' className='pull-right'
                                    onClick={this.deleteFixture}>Delete</Button>
                            {' '}
                            <ToggleDisplay show={!ef.locked}>
                                <Button bsStyle='primary'
                                        disabled={disableLockBtn}
                                        className='pull-right'
                                        onClick={this.lockFixture}>Lock</Button>
                                {' '}
                            </ToggleDisplay>
                            <ToggleDisplay show={ef.locked}>
                                <Button bsStyle='warning'
                                        className='pull-right'
                                        onClick={this.unlockFixture}>Unlock</Button>
                                {' '}
                            </ToggleDisplay>
                        </Grid>

                    </ToggleDisplay>
                    <ToggleDisplay show={!conn.schedule.locked}>
                        <h3>Schedule must be locked to edit fixture parameters.</h3>
                    </ToggleDisplay>

                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.closeModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}