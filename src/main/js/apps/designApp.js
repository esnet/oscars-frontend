import React, {Component} from 'react';
import {Row, Col, Button} from 'react-bootstrap';
import {inject} from 'mobx-react';


import NetworkMap from '../components/networkMap';
import AddFixtureModal from '../components/addFixtureModal';
import EditFixtureModal from '../components/editFixtureModal';
import EditJunctionModal from '../components/editJunctionModal';
import EditPipeModal from '../components/editPipeModal';
import DesignHelpModal from '../components/designHelpModal'
import ConnectionErrorsModal from '../components/connectionErrorsModal';
import DesignDrawing from '../components/designDrawing';
import DesignComponents from '../components/designComponents';
import ScheduleControls from '../components/scheduleControls';
import ConnectionControls from '../components/connectionControls';
import SelectPortTypeahead from '../components/selectPortTypeahead';
import HoldTimer from '../components/holdTimer';

@inject('controlsStore', 'mapStore', 'designStore', 'commonStore', 'modalStore')
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
        this.props.modalStore.openModal('addFixture');
    };

    render() {
        return (
            <Row>
                <Col md={3} sm={3}>
                    <ConnectionControls />
                    <ScheduleControls />
                    { /* <DesignControls /> */}
                </Col>
                <Col md={6} sm={6}>
                    <NetworkMap selectDevice={this.selectDevice}/>
                    <DesignDrawing />
                </Col>
                <Col md={3} sm={3}>
                    <SelectPortTypeahead/>
                    <HoldTimer/>
                    <DesignComponents />
                </Col>
                <AddFixtureModal />
                <EditFixtureModal />
                <EditJunctionModal />
                <EditPipeModal />
                <ConnectionErrorsModal />
                <DesignHelpModal />
                { /*<DesignErrorsModal /> */}
            </Row>
        );
    }

}
