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

    // this will keep updating the next -ERO options as the ERO changes;
    disposeOfEroOptionsUpdate = autorunAsync('ero options update', () => {
        let ep = this.props.controlsStore.editPipe;
        let submitEro = toJS(ep.ero.hops);


        // keep track of the last hop; if we've reached Z we shouldn't keep going
        let lastHop = ep.a;
        if (ep.ero.hops.length > 0) {
            lastHop = ep.ero.hops[ep.ero.hops.length - 1];
        } else {
            // if there's _nothing_ in our ERO then ask for options from pipe.a
            submitEro.push(ep.a);
        }

        // if this is the last hop, don't provide any options
        if (lastHop === ep.z) {
            this.setState({options: []});
            return;
        }

        myClient.submit('POST', '/api/pce/nextHopsForEro', submitEro)
            .then(
                action((response) => {
                    let nextHops = JSON.parse(response);
                    if (nextHops.length > 0) {
                        let opts = [];
                        nextHops.map(h => {
                            let entry = {
                                id: h.urn,
                                label: h.urn + ' through ' + h.through + ' to ' + h.to,
                                through: h.through,
                                to: h.to
                            };
                            opts.push(entry);
                        });
                        this.setState({options: opts});
                    }

                }));
    }, 500);

    componentWillUnmount() {
        this.disposeOfEroOptionsUpdate();
    }


    onTypeaheadSelection = selection => {
        if (selection.length === 0) {
            return;
        }

        let wasAnOption = false;
        let through = '';
        let urn = '';
        let to = '';
        this.state.options.map(opt => {
            if (opt.label === selection) {
                wasAnOption = true;
                through = opt.through;
                urn = opt.id;
                to = opt.to;
            }
        });

        if (wasAnOption) {
            let ep = this.props.controlsStore.editPipe;
            let ero = [];
            ep.manual.ero.map(e => {
                ero.push(e);
            });
            ero.push(through);
            ero.push(urn);
            ero.push(to);

            this.props.controlsStore.setParamsForEditPipe({
                ero: {
                    hops: ero
                },
                manual: {ero: ero}
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