import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button, Grid, Row, Col} from 'react-bootstrap';

import VlanSelect from './vlanSelect';
import BwSelect from './bwSelect';

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
        const editFixture = this.props.controlsStore.editFixture;
        this.props.sandboxStore.deleteFixtureDeep(editFixture.fixtureId);
        this.closeModal();
    };


    render() {
        let showModal = this.props.controlsStore.modals.get(modalName);
        let ef = this.props.controlsStore.editFixture;

        const label = ef.device + ':' + ef.label;


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