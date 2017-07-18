import React, {Component} from 'react';
import {Typeahead} from 'react-bootstrap-typeahead';
import {inject, observer} from 'mobx-react';
import {action, toJS, autorunAsync} from 'mobx';
import myClient from '../agents/client'

require('react-bootstrap-typeahead/css/ClearButton.css');
require('react-bootstrap-typeahead/css/Loader.css');
require('react-bootstrap-typeahead/css/Token.css');
require('react-bootstrap-typeahead/css/Typeahead.css');


@inject('controlsStore', 'designStore')
@observer
export default class EroTypeahead extends Component {

    constructor(props) {
        super(props);

    }

    state = {
        options: []
    };

    // this will automagically update the ERO options;
    disposeOfEroOptionsUpdate = autorunAsync('ero options update', () => {
        let editPipe = this.props.controlsStore.editPipe;
        let where = editPipe .nextHopsOrigin;
        if (where === editPipe.z) {
            this.setState({options: []});
            return;
        }
        if (where.length === 0) {
            return;
        }

        myClient.submit('GET', '/api/topo/nextHopsFrom/' + where, '')
            .then(
                action((response) => {
                    let nextHops = JSON.parse(response);
                    if (nextHops.length > 0) {
                        let opts = [];
                        nextHops.map(h => {
                            let entry = {
                                id: h.urn,
                                label: h.urn + ' to ' + h.to,
                                to: h.to
                            };
                            if (!editPipe.ero.includes(h.urn)) {
                                opts.push(entry);
                            }
                        });
                        this.setState({options: opts});
                    }

                }));
    }, 500);

    componentWillMount() {
        let editPipe = this.props.controlsStore.editPipe;
    }

    componentWillUnmount() {
        this.disposeOfEroOptionsUpdate();
    }


    onTypeaheadSelection = selection => {
        if (selection.length === 0) {
            return;
        }

        let wasAnOption = false;
        let nextOrigin = '';
        let urn = '';
        this.state.options.map(opt => {
            if (opt.label === selection) {
                wasAnOption = true;
                nextOrigin = opt.to;
                urn = opt.id;
                console.log('next: '+nextOrigin);
            }
        });

        if (wasAnOption) {
            let editPipe = this.props.controlsStore.editPipe;
            let ero = [];
            editPipe.ero.map(e => {
                ero.push(e);
            });
            ero.push(urn);

            this.props.controlsStore.setParamsForEditPipe({
                ero: ero,
                nextHopsOrigin: nextOrigin
            });

            this.typeAhead.getInstance().clear();
        }

    };

    render() {

        return (
            <Typeahead
                minLength={0}
                ref={(ref) => {
                    this.typeAhead = ref;
                }}

                placeholder='choose from selection'
                options={this.state.options}
                onInputChange={this.onTypeaheadSelection}
                clearButton
            />
        );
    }
}