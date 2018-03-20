import React, {Component} from 'react';
import {Typeahead} from 'react-bootstrap-typeahead';
import {inject, observer} from 'mobx-react';
import {toJS} from 'mobx';
import transformer from '../lib/transform';

import {
    Form, FormGroup, InputGroup, InputGroupAddon, InputGroupText,
    Popover, PopoverBody, PopoverHeader
} from 'reactstrap';
import FontAwesome from 'react-fontawesome';

require('react-bootstrap-typeahead/css/Typeahead.css');


@inject('topologyStore', 'controlsStore', 'designStore', 'mapStore', 'modalStore')
@observer
export default class SelectPortTypeahead extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.topologyStore.loadEthernetPorts();
        this.setState({
            showHelp: false,
        });
    }

    toggleHelp = () => {
        this.setState({showHelp: !this.state.showHelp});
    };

    onTypeaheadSelection = (port) => {
        const {ethPorts} = this.props.topologyStore;

        let isInEthPorts = false;
        let device = '';
        ethPorts.map((entry) => {
            if (entry.id === port) {
                isInEthPorts = true;
                device = entry.device;
            }
        });
        if (isInEthPorts) {
            let params = {
                'port': port,
                'device': device,
            };
            this.typeAhead.getInstance().clear();
            this.typeAhead.getInstance().blur();


            let fixture = this.props.designStore.addFixtureDeep(params);

            this.props.mapStore.addColoredNode({id: device, color: 'green'});
            this.props.mapStore.setZoomOnColored(true);

            const editFixtureParams = transformer.newFixtureToEditParams(fixture);
            this.props.controlsStore.setParamsForEditFixture(editFixtureParams);

            this.props.modalStore.openModal('editFixture');

        }
    };

    render() {
        const {ethPorts} = this.props.topologyStore;

        let options = [];
        if (typeof ethPorts !== 'undefined') {
            options = toJS(ethPorts);
        }

        const spHelp =
            <Popover placement='left'
                     isOpen={this.state.showHelp}
                     target='spHelpIcon'
                     toggle={this.toggleHelp}>
                <PopoverHeader>Text-based port selection.</PopoverHeader>
                <PopoverBody>
                    <p>Start typing in the text box to bring up an auto-complete list of ports
                        matching your input. Select with up and down arrow keys.
                    </p>
                    <p>Click on a port (or finish typing and press Enter) to add
                        a new fixture with that port.</p>
                </PopoverBody>
            </Popover>;


        return (
            <Form inline>
                <FormGroup>
                    <InputGroup>
                        <Typeahead
                            innerRef={(ref) => {
                                this.typeAhead = ref;
                            }}
                            placeholder='Add a fixture'
                            minLength={2}
                            options={options}
                            onInputChange={this.onTypeaheadSelection}
                        />
                        <InputGroupAddon addonType='append'>
                            <InputGroupText> <FontAwesome
                                onClick={this.toggleHelp}
                                name='question'
                                id='spHelpIcon'/>
                            </InputGroupText>
                        </InputGroupAddon>
                    </InputGroup>
                    {spHelp}
                </FormGroup>
            </Form>
        );
    }
}