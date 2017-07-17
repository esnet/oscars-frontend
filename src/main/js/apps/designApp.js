import React, {Component} from 'react';
import {Row, Col} from 'react-bootstrap';
import {inject} from 'mobx-react';


import NetworkMap from '../components/networkMap';
import AddFixtureModal from '../components/addFixtureModal';
import EditFixtureModal from '../components/editFixtureModal';
import EditJunctionModal from '../components/editJunctionModal';
import EditPipeModal from '../components/editPipeModal';
import DisplayErrorsModal from '../components/displayErrorsModal';
import DesignDrawing from '../components/designDrawing';
import DesignComponents from '../components/designComponents';
import SandboxControls from '../components/sandboxControls';
import DesignControls from '../components/designControls';
import SelectPortTypeahead from '../components/selectPortTypeahead';

@inject('controlsStore', 'mapStore', 'designStore', 'commonStore')
export default class DesignApp extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.mapStore.setColoredNodes([]);
        this.props.mapStore.setColoredEdges([]);
        this.props.designStore.clear();
        this.props.commonStore.setActiveNav('design');

        // TODO: a better clear
        this.props.controlsStore.setParamsForConnection({description: ''});
    }

    componentWillUnmount() {
        this.props.mapStore.setColoredNodes([]);
        this.props.mapStore.setColoredEdges([]);
        this.props.designStore.clear();
    }


    selectDevice = (device) => {
        this.props.controlsStore.setParamsForAddFixture({device: device});
        this.props.controlsStore.openModal('addFixture');
    };

    render() {
        return (
            <Row>
                <Col md={3} sm={3}>
                    <SelectPortTypeahead/>
                    <SandboxControls />
                    <DesignControls />
                </Col>
                <Col md={6} sm={6}>
                    <NetworkMap selectDevice={this.selectDevice}/>
                    <DesignDrawing />
                </Col>
                <Col md={3} sm={3}>
                    <DesignComponents />
                </Col>
                <AddFixtureModal />
                <EditFixtureModal />
                <EditJunctionModal />
                <EditPipeModal />
                <DisplayErrorsModal />
            </Row>
        );
    }

}
