import React, {Component} from 'react';
import {Typeahead} from 'react-bootstrap-typeahead';
import {inject, observer} from 'mobx-react';
import {toJS} from 'mobx';
import transformer from '../lib/transform';
import {Panel} from 'react-bootstrap';


@inject('topologyStore', 'controlsStore', 'sandboxStore', 'mapStore')
@observer
export default class SelectPort extends Component {
    componentWillMount() {
        this.props.topologyStore.loadAvailablePorts();
    }

    constructor(props) {
        super(props);
    }

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
            let params = {
                'port': port,
                'device': device,
            };
            this.typeAhead.getInstance().clear();
            this.typeAhead.getInstance().blur();


            let fixture = this.props.sandboxStore.addFixtureDeep(params);

            console.log(device);
            this.props.mapStore.addColoredNode({id: device, color:'red'});
            this.props.mapStore.setZoomOnColored(true);

            const editFixtureParams = transformer.newFixtureToEditParams(fixture);
            this.props.controlsStore.setParamsForEditFixture(editFixtureParams);

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
            <Panel>
                {typeAhead}
            </Panel>
        );
    }
}