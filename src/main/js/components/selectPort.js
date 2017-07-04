import React, {Component} from 'react';
import {Typeahead} from 'react-bootstrap-typeahead';
import {inject, observer} from 'mobx-react';
import {toJS} from 'mobx';
import {Panel, Glyphicon} from 'react-bootstrap';
import SelectPortFromMap from "./selectPortFromMap";


@inject('topologyStore', 'sandboxStore')
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
        this.handleFixtureSelection = this.handleFixtureSelection.bind(this);
    }

    handleFixtureSelection(port) {
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
            this.props.sandboxStore.selectPort(port, device);
            this.typeAhead.getInstance().clear();
        }
    }

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
            onInputChange={this.handleFixtureSelection}
        />;
        let icon = this.state.showMap ? 'chevron-down' : 'chevron-right';

        let mapHeader = <div onClick={ () => this.setState({showMap: !this.state.showMap})}>
            Network map <Glyphicon className='pull-right' glyph={icon}/>
        </div>;


        return (
            <div>
                {typeAhead}

                <Panel collapsible expanded={this.state.showMap} header={mapHeader}>
                    <SelectPortFromMap />
                </Panel>

            </div>
        );
    }
}