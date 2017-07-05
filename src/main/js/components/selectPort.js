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

    state = {
        showMap: true
    };

    constructor(props) {
        super(props);
    }
    selectDevice = (device) => {
        this.props.controlsStore.selectDevice(device);
        this.props.controlsStore.openModal('devicePorts');
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
                'vlan': null,
                'vlanExpression': '',
                'availableVlans': '',
                'ingress': 0,
                'egress': 0
            };
            this.typeAhead.getInstance().clear();

            let fixture = this.props.sandboxStore.addFixtureDeep(params);
            this.props.controlsStore.selectFixture(fixture);
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

        let icon = this.state.showMap ? 'chevron-down' : 'chevron-right';

        let mapHeader = <div onClick={ () => this.setState({showMap: !this.state.showMap})}>
            Network map <Glyphicon className='pull-right' glyph={icon}/>
        </div>;


        return (
            <div>
                {typeAhead}

                <Panel collapsible expanded={this.state.showMap} header={mapHeader}>
                    <TopologyMap onClickDevice={this.selectDevice} />
                </Panel>

            </div>
        );
    }
}