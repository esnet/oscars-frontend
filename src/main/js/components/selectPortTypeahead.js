import React, {Component} from 'react';
import {Typeahead} from 'react-bootstrap-typeahead';
import {inject, observer} from 'mobx-react';
import {toJS} from 'mobx';
import transformer from '../lib/transform';
import {Well, FormGroup, InputGroup, Glyphicon, OverlayTrigger, Popover} from 'react-bootstrap';


@inject('topologyStore', 'controlsStore', 'designStore', 'mapStore')
@observer
export default class SelectPortTypeahead extends Component {
    componentWillMount() {
        this.props.topologyStore.loadEthernetPorts();
    }

    constructor(props) {
        super(props);
    }

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

            console.log(device);
            this.props.mapStore.addColoredNode({id: device, color: 'red'});
            this.props.mapStore.setZoomOnColored(true);

            const editFixtureParams = transformer.newFixtureToEditParams(fixture);
            this.props.controlsStore.setParamsForEditFixture(editFixtureParams);

            this.props.controlsStore.openModal('editFixture');

        }
    };

    render() {
        const {ethPorts} = this.props.topologyStore;

        let options = [];
        if (typeof ethPorts !== 'undefined') {
            options = toJS(ethPorts);
        }

        let myHelp = <Popover id='help-selectPortTypeahead' title='Help'>
            <p>Start typing in the text box to bring up an auto-complete list of ports
                matching your input. Select with up and down arrow keys.
            </p>
            <p>Click on a port (or finish typing and press Enter) to add
                a new fixture with that port.</p>

        </Popover>;
        return (
                <FormGroup>
                    <InputGroup>
                        <Typeahead
                            ref={(ref) => {
                                this.typeAhead = ref;
                            }}
                            placeholder='type to add a fixture'
                            minLength={2}
                            options={options}
                            onInputChange={this.onTypeaheadSelection}
                        />
                        <InputGroup.Addon>
                            <OverlayTrigger trigger='click' rootClose placement='right' overlay={myHelp}>
                                <Glyphicon className='pull-right' glyph='question-sign'/>
                            </OverlayTrigger>

                        </InputGroup.Addon>
                    </InputGroup>
                </FormGroup>
        );
    }
}