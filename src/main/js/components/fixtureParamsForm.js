import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Button, Grid, Row, Col} from 'react-bootstrap';
import VlanSelect from './vlanSelect';
import BwSelect from './bwSelect';


@inject('sandboxStore')
@observer
export default class FixtureParamsForm extends Component {
    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
        this.addFixture = this.addFixture.bind(this);
        this.setModified = this.setModified.bind(this);

        this.deleteFixture = this.deleteFixture.bind(this);
        this.updateFixture = this.updateFixture.bind(this);
    }

    state = {
        modified: false
    };

    closeModal() {
        this.props.sandboxStore.closeModal(this.props.modal);
    }


    updateFixture() {
        const ingress = this.props.sandboxStore.selection.ingress;
        const egress = this.props.sandboxStore.selection.egress;
        const vlan = this.props.sandboxStore.selection.vlan;
        let id = this.props.sandboxStore.selection.fixture;
        this.setModified(false);
        this.props.sandboxStore.updateFixture(id, vlan, ingress, egress);
    }

    addFixture() {
        const port = this.props.sandboxStore.selection.port;
        const device = this.props.sandboxStore.selection.device;
        const ingress = this.props.sandboxStore.selection.ingress;
        const egress = this.props.sandboxStore.selection.egress;
        const vlan = this.props.sandboxStore.selection.vlan;

        let id = this.props.sandboxStore.addFixture(port, device, vlan, ingress, egress);
        this.props.sandboxStore.selectFixture(id, false);
        this.closeModal();
    }

    deleteFixture() {
        this.props.sandboxStore.deleteFixture(this.props.sandboxStore.selection.fixture);
        this.closeModal();
    }

    setModified(state) {
        this.setState({modified: state});
    }


    render() {

        let buttons = null;
        if (this.props.modal === 'fixture') {
            if (this.state.modified) {
                buttons = <div>
                    <Button bsStyle='primary' onClick={this.updateFixture}>Update</Button>
                    {' '}
                    <Button onClick={this.deleteFixture}>Delete</Button>
                </div>;
            } else {
                buttons = <div>
                    <Button onClick={this.deleteFixture}>Delete</Button>
                </div>;
            }

        } else {
            buttons = <div>
                <Button bsStyle='primary' onClick={this.addFixture}>Add</Button>
            </div>;
        }

        return (
            <form>
                <Grid>
                    <Row>
                        <Col md={3} sm={3}>
                            <VlanSelect modal={this.props.modal} setModified={this.setModified}/>
                        </Col>
                        <Col md={3} sm={3}>
                            <BwSelect modal={this.props.modal} setModified={this.setModified}/>

                        </Col>
                    </Row>
                </Grid>
                { buttons }
            </form>
        );
    }
}