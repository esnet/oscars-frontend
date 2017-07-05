import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Button, Grid, Row, Col} from 'react-bootstrap';
import VlanSelect from './vlanSelect';
import BwSelect from './bwSelect';


@inject('controlsStore', 'sandboxStore')
@observer
export default class EditFixtureForm extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        modified: false
    };

    updateFixture = () => {
        const fixture = this.props.controlsStore.fixture;
        let params = {
            ingress: fixture.ingress,
            egress: fixture.egress,
            vlanExpression: fixture.vlanExpression
        };
        this.setModified(false);
        this.props.sandboxStore.updateFixture(fixture.id, params);
    };

    deleteFixture = () => {
        const fixture = this.props.controlsStore.fixture;

        this.props.sandboxStore.deleteFixtureDeep(fixture.id);
        this.props.closeModal();
    };

    setModified = (state) => {
        this.setState({modified: state});
    };

    render() {
        let deleteButton = <Button bsStyle='warning' onClick={this.deleteFixture}>Delete</Button>;
        let updateButton = null;
        if (this.state.modified) {
            updateButton = <Button bsStyle='primary' onClick={this.updateFixture}>Update</Button>;
        }

        let buttons = <div>
            { updateButton }
            {' '}
            { deleteButton }
        </div>;


        return (
            <Grid fluid={true}>
                <Row>
                    <Col md={6} sm={6}>
                        <VlanSelect setModified={this.setModified}/>

                    </Col>
                    <Col md={6} sm={6}>
                        <BwSelect setModified={this.setModified}/>
                    </Col>
                </Row>
                { buttons }
            </Grid>
        );
    }

}