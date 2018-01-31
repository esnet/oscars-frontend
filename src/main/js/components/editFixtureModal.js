import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button, Grid, Row, Col, Popover, OverlayTrigger, Glyphicon} from 'react-bootstrap';

import {toJS, action, autorun, computed, whyRun} from 'mobx';
import ToggleDisplay from 'react-toggle-display';
import Confirm from 'react-confirm-bootstrap';

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

        let helpPopover = <Popover id='help-editFixture' title='Edit fixture help'>
            <p>Here you can edit / view parameters for this fixture. </p>

            <p>In the initial 'unlocked' mode, when the dialog opens the bandwidth and VLAN controls will be editable
                and reset to default values.
                If all values are within acceptable ranges the 'Lock Fixture' button will be available.</p>
            <p>You will need to lock all fixtures (and pipes) to commit the connection request.</p>
            <p>In 'locked' mode, you will only be able to view previous selection. The 'Unlock' button will be available
                to switch back.</p>

        </Popover>;

        let title = ef.device + ':' + ef.label;


        let header = <p>{title}
            <OverlayTrigger trigger='click' rootClose placement='bottom' overlay={helpPopover}>
                <Glyphicon className='pull-right' glyph='question-sign'/>
            </OverlayTrigger>
            {' '}
        </p>;


        const disableLockBtn = !ef.vlan.acceptable || !ef.bw.acceptable;

        return (
            <Modal bsSize='large' show={showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{header}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ToggleDisplay show={conn.schedule.locked}>
                        <Grid fluid={true}>
                            <Row>
                                <Col md={5} sm={5} lg={5}>
                                    <VlanSelect/>
                                </Col>
                                <Col md={7} sm={7} lg={7}>
                                    <BwSelect/>
                                </Col>
                            </Row>

                            <Confirm
                                onConfirm={this.deleteFixture}
                                body="Are yous sure you want to delete?"
                                confirmText="Confirm"
                                title="Delete fixture">
                                <Button bsStyle='warning' className='pull-right'>Delete</Button>
                            </Confirm>


                            {' '}
                            <ToggleDisplay show={!ef.locked}>
                                <Button bsStyle='primary'
                                        disabled={disableLockBtn}
                                        className='pull-right'
                                        onClick={this.lockFixture}>Lock</Button>
                            </ToggleDisplay>
                            {' '}
                            <ToggleDisplay show={ef.locked}>
                                <Button bsStyle='warning'
                                        className='pull-right'
                                        onClick={this.unlockFixture}>Unlock</Button>
                            </ToggleDisplay>
                            {' '}
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