import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {action, toJS, autorunAsync} from 'mobx';
import Topology from '../lib/topology';
import ToggleDisplay from 'react-toggle-display';
import {
    Modal, Button, FormControl, ControlLabel, FormGroup, Form,
    Well, Panel, OverlayTrigger, Glyphicon, Popover, Row, Col,
    Tabs, Tab, ButtonToolbar,
    ListGroup, ListGroupItem, HelpBlock, InputGroup, PanelGroup
} from 'react-bootstrap';
import Select from 'react-select-plus';

require('react-bootstrap-typeahead/css/ClearButton.css');
require('react-bootstrap-typeahead/css/Loader.css');
require('react-bootstrap-typeahead/css/Token.css');
require('react-bootstrap-typeahead/css/Typeahead.css');
import {size} from 'lodash-es';
import 'react-select-plus/dist/react-select-plus.css';
import PropTypes from "prop-types";


@inject('controlsStore', 'topologyStore')
@observer
export default class EroSelect extends Component {

    constructor(props) {
        super(props);

    }

    populateIncludeDispose = autorunAsync('populateIncluded', () => {
        const ep = this.props.controlsStore.editPipe;

        if (size(ep.ero.include) === 0) {
            if (size(ep.ero.hops) >= 2) {
                this.props.controlsStore.setParamsForEditPipe({
                    ero: {
                        include: [ep.a, ep.z]
                    }
                });
            }

        }


    }, 1000);

    componentWillMount() {
        this.props.topologyStore.loadAdjacencies();
    }

    componentWillUnmount() {
        this.populateIncludeDispose();

    }

    nextHopOptions(urn, adjacencies, ero) {
        let options = [
            {
                label: 'Immediate',
                options: []

            },
            {
                label: 'Other',
                options: []
            }

        ];

        let added = ero.slice();
        for (let adjcy of adjacencies) {
            let urns = [];
            let label = '';
            if (urn === adjcy.a) {
                label = adjcy.b + ' -- ' + adjcy.y;
                for (let urn of [adjcy.b, adjcy.y]) {
                    if (!added.includes(urn)) {
                        urns.push(urn);
                        added.push(urn);
                    }
                }
            } else if (urn === adjcy.b) {
                label = adjcy.y;
                if (!added.includes(adjcy.y)) {
                    urns.push(adjcy.y);
                    added.push(adjcy.y);
                }
            } else if (urn === adjcy.y) {
                label = adjcy.z;
                for (let urn of [adjcy.z]) {
                    if (!added.includes(urn)) {
                        urns.push(urn);
                        added.push(urn);
                    }
                }
            }
            if (urns.length > 0 ) {
                let value = JSON.stringify(urns);
                options[0].options.push({label: label, value: value});
            }

        }


        for (let adjcy of adjacencies) {
            if (!added.includes(adjcy.a)) {
                let value = JSON.stringify([adjcy.a]);
                options[1].options.push({label: adjcy.a, value: value});
                added.push(adjcy.a);
            }
            if (!added.includes(adjcy.b)) {
                let value = JSON.stringify([adjcy.b]);
                options[1].options.push({label: adjcy.b, value: value});
                added.push(adjcy.b);
            }
            if (!added.includes(adjcy.y)) {
                let value = JSON.stringify([adjcy.y]);
                options[1].options.push({label: adjcy.y, value: value});
                added.push(adjcy.y);
            }
            if (!added.includes(adjcy.z)) {
                let value = JSON.stringify([adjcy.z]);
                options[1].options.push({label: adjcy.z, value: value});
                added.push(adjcy.z);
            }
        }

        return options;
    }

    removeUrn = (i) => {
        const ep = this.props.controlsStore.editPipe;
        let new_include = ep.ero.include.slice();
        new_include.splice(i, 1);
        let params = {
            ero: {
                include: new_include
            }
        };

        this.props.controlsStore.setParamsForEditPipe(params);
    };

    render() {
        const ep = this.props.controlsStore.editPipe;
        const adjcies = this.props.topologyStore.adjacencies;

        if (size(ep.ero.include) === 0) {
            return <p>Loading..</p>;
        }

        const last = ep.z;

        let items = [];


        ep.ero.include.map((urn, i) => {
            if (i === 0 || urn === last) {
                items.push(<ListGroupItem key={urn}>{urn}</ListGroupItem>);
            } else {
                items.push(
                    <ListGroupItem key={urn}>{urn}
                        <ToggleDisplay show={!ep.locked}>
                            <Glyphicon className='pull-right' glyph='minus' onClick={() => this.removeUrn(i)}/>
                        </ToggleDisplay>
                    </ListGroupItem>);

            }

            if (urn !== last && !ep.locked) {
                let next_urn = ep.ero.include[i + 1];

                if (Topology.adjacent(urn, next_urn, adjcies) === 'NONE') {
                    let options = this.nextHopOptions(urn, adjcies, ep.ero.include);
                    items.push(<ListGroupItem key={urn + '-next'}>
                        <NextHopSelect urn={urn} options={options} index={i}/>

                    </ListGroupItem>)
                }
                ;
            }
        });

        return (
            <ListGroup>{items}</ListGroup>

        );
    }
}

@inject('controlsStore')
class NextHopSelect extends Component {
    state = {
        selectedOption: {
            label: '',
            value: ''
        },
    };

    handleChange = (selectedOption) => {
        if (selectedOption != null && selectedOption.value !== '') {
            this.setState({selectedOption});
        }
    };

    insertUrn = () => {
        const {selectedOption} = this.state;
        if (selectedOption != null && selectedOption.value !== '') {
            let urns = JSON.parse(selectedOption.value);

            const ep = this.props.controlsStore.editPipe;
            let new_include = ep.ero.include.slice();
            let start = this.props.index + 1;
            urns.map((urn, i) => {
                new_include.splice(start + i, 0, urn);
            });
            let params = {
                ero: {
                    include: new_include
                }
            };

            this.props.controlsStore.setParamsForEditPipe(params);

        }
    };

    render() {
        const {selectedOption} = this.state;
        let value = '';
        if (selectedOption != null) {
            value = selectedOption.value;
        }

        return (
            <InputGroup>
                <Select name={this.props.urn + '-next-select'}
                        onChange={this.handleChange}
                        value={value}
                        options={this.props.options}/>
                <InputGroup.Addon>
                    <Glyphicon className='pull-right' glyph='plus' onClick={this.insertUrn}/>
                </InputGroup.Addon>
            </InputGroup>

        );

    }


}

NextHopSelect.propTypes = {
    urn: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    options: PropTypes.array.isRequired
};