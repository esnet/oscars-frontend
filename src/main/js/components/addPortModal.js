import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Grid, Row, Col} from 'react-bootstrap';


@inject('sandboxStore')
@observer
export default class AddPortModal extends Component {
    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
        this.addFixture = this.addFixture.bind(this);
        this.toggleSymmetrical = this.toggleSymmetrical.bind(this);
        this.onIngressBwChange = this.onIngressBwChange.bind(this);
    }

    state = {
        symmetrical: true,
    };

    closeModal() {
        this.props.sandboxStore.closeModal('port');
    }

    addFixture() {
        const port = this.props.sandboxStore.selection.port;
        const device = this.props.sandboxStore.selection.device;
        let id = this.props.sandboxStore.addFixture(port, device);
        this.props.sandboxStore.selectFixture(id, false);
        this.closeModal();
    }


    toggleSymmetrical() {
        this.setState({
            symmetrical: !this.state.symmetrical
        });
    }

    onIngressBwChange(e) {
        if (this.state.symmetrical) {
            this.egress.value = e.target.value;
        }
    }

    render() {
        let port = this.props.sandboxStore.selection.port;
        let device = this.props.sandboxStore.selection.device;
        let showModal = this.props.sandboxStore.modals.get('port');


        return (
            <div>
                <Modal show={showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{port} ({device})</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form>
                            <Grid>
                                <Row>
                                    <Col md={3} sm={3}>
                                        <FormGroup controlId="vlan">
                                            <ControlLabel>VLAN</ControlLabel>
                                            {' '}
                                            <FormControl type="text" placeholder="2000-2999"/>
                                        </FormGroup>
                                    </Col>
                                    <Col md={3} sm={3}>
                                        <FormGroup controlId="ingress">
                                            <ControlLabel>Bandwidth:</ControlLabel>
                                            <FormControl type="text" placeholder="0-100000"
                                                         onChange={this.onIngressBwChange}/>
                                        </FormGroup>
                                        <FormGroup controlId="symmetrical">
                                            <Checkbox defaultChecked={this.state.symmetrical} inline
                                                      onChange={this.toggleSymmetrical}>
                                                Symmetrical
                                            </Checkbox>
                                        </FormGroup>
                                        <FormGroup controlId="egress">
                                            <ControlLabel>Egress</ControlLabel>
                                            <FormControl inputRef={ref => {
                                                this.egress = ref;
                                            }}
                                                         disabled={this.state.symmetrical}

                                                         type="text" placeholder="0-10000"/>
                                        </FormGroup>
                                    </Col>
                                </Row>
                            </Grid>
                            <Button onClick={this.addFixture}>Accept</Button>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>


            </div>
        );
    }
}