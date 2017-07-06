import React, {Component} from 'react';
import {Typeahead} from 'react-bootstrap-typeahead';
import {inject, observer} from 'mobx-react';
import {toJS} from 'mobx';
import {Panel, Glyphicon} from 'react-bootstrap';
import TopologyMap from './topologyMap';


@inject('topologyStore', 'controlsStore', 'sandboxStore')
@observer
export default class SelectPort extends Component {
    componentWillMount() {
        this.props.topologyStore.loadAvailablePorts();
    }

    constructor(props) {
        super(props);
    }
    selectDevice = (device) => {
        this.props.controlsStore.setParamsForAddFixture({device: device});
        this.props.controlsStore.openModal('addFixture');
    };


    onTypeaheadSelection = (port) => {
        const {availPorts} = this.props.topologyStore;
        let isInAvailPorts = false;
        let device = '';
        availPorts.map((entry) => {
            if (entry.id === port) {
                isInAvailPorts = true;
                device = entry.device;
            }
        });
        if (isInAvailPorts) {
            let params ={
                'port': port,
                'device': device,
            };
            this.typeAhead.getInstance().clear();
            this.typeAhead.getInstance().blur();


            let fixture = this.props.sandboxStore.addFixtureDeep(params);
            this.props.controlsStore.setParamsForEditFixture({
                fixtureId: fixture.id,
                label: fixture.label,
            });
            this.props.controlsStore.openModal('editFixture');

        }
    };

    render() {
        const {availPorts} = this.props.topologyStore;

        let options = [];
        if (typeof availPorts !== 'undefined') {
            options = toJS(availPorts);
        }

        let typeAhead = <Typeahead
            ref={(ref) => {
                this.typeAhead = ref;
            }}
            placeholder='type to add a fixture'
            options={options}
            maxVisible={2}
            onInputChange={this.onTypeaheadSelection}
        />;

        return (
            <div>
                {typeAhead}
                <TopologyMap onClickDevice={this.selectDevice} />


            </div>
        );
    }
}