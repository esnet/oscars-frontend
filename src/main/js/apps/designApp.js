import React, {Component} from 'react';
import {Row, Col} from 'react-bootstrap';
import {inject} from 'mobx-react';


import NetworkMap from '../components/networkMap';
import AddFixtureModal from '../components/addFixtureModal';
import EditFixtureModal from '../components/editFixtureModal';
import EditJunctionModal from '../components/editJunctionModal';
import EditPipeModal from '../components/editPipeModal';
import DesignErrorsModal from '../components/designErrorsModal';
import ConnectionErrorsModal from '../components/connectionErrorsModal';
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
        this.props.commonStore.setActiveNav('design');
    }

    componentWillUnmount() {
        this.props.mapStore.clearColored();
        this.props.controlsStore.clearEditConnection();
        this.props.controlsStore.clearEditDesign();
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
                <ConnectionErrorsModal />
                <DesignErrorsModal />
            </Row>
        );
    }

}
