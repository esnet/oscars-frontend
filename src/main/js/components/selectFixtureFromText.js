import React, {Component} from 'react';
import {Typeahead} from 'react-bootstrap-typeahead';
import {inject, observer} from 'mobx-react';
import {toJS} from 'mobx';

@inject('topologyStore', 'sandboxStore')
@observer
export default class SelectFixtureFromText extends Component {
    componentWillMount() {
        this.props.topologyStore.loadEdgePorts();
    }

    constructor(props) {
        super(props);
        this.handleFixtureSelection = this.handleFixtureSelection.bind(this);
    }

    handleFixtureSelection(urn) {
        const {edgePorts} = this.props.topologyStore;
        if (edgePorts.includes(urn)) {
            this.props.sandboxStore.selectFixture(urn);
        }
    }

    render() {
        const {edgePorts} = this.props.topologyStore;


        let options = [];
        if (typeof edgePorts !== "undefined") {
            options = toJS(edgePorts);
        }
        return (
            <Typeahead
                options={options}
                maxVisible={2}
                onInputChange={this.handleFixtureSelection}
            />
        );
    }
}