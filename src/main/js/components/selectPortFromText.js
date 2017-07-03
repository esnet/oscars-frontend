import React, {Component} from 'react';
import {Typeahead} from 'react-bootstrap-typeahead';
import {inject, observer} from 'mobx-react';

@inject('topologyStore', 'sandboxStore')
@observer
export default class SelectPortFromText extends Component {
    componentWillMount() {
        this.props.topologyStore.loadAvailablePorts();
    }

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
        }
    }

    render() {
        const {availPorts} = this.props.topologyStore;


        let options = [];
        if (typeof availPorts !== 'undefined') {
            options = toJS(availPorts);
        }
        return (
            <Typeahead
                placeholder='type to add a fixture'
                options={options}
                maxVisible={2}
                onInputChange={this.handleFixtureSelection}
            />
        );
    }
}