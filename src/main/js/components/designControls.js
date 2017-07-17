import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorunAsync, toJS} from 'mobx';


import {Button, Popover, Form, Glyphicon, Panel, FormGroup, FormControl, OverlayTrigger} from 'react-bootstrap';

import Transformer from '../lib/transform';
import myClient from '../agents/client';


@inject('controlsStore', 'designStore', 'accountStore')
@observer
export default class DesignControls extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // new design id
        if (this.props.controlsStore.editDesign.designId.length === 0) {

            myClient.submitWithToken('GET', '/protected/designs/generateId', '')
                .then(
                    action((response) => {
                        console.log(response);
                        let params = {
                            designId: response
                        };
                        this.props.controlsStore.setParamsForEditDesign(params);
                    }));
        }
    }

    componentWillUnmount() {
        this.props.controlsStore.clearEditDesign();
    }


    saveDesign = () => {
        let editDesign = this.props.controlsStore.editDesign;
        let username = this.props.accountStore.loggedin.username;
        let cmp =  Transformer.toComponents(this.props.designStore.design);
        let newDesign = {
            designId: editDesign.designId,
            description: editDesign.description,
            username: username,
            cmp: cmp
        };

        console.log(newDesign);
        myClient.submitWithToken('POST', '/protected/designs/'+editDesign.designId, newDesign)
            .then(
                action((response) => {
                    console.log(response);
                }));
    };


    onDescriptionChange = (e) => {
        const params = {
            description: e.target.value
        };
        this.props.controlsStore.setParamsForEditDesign(params);
    };

    render()  {
        let editDesign = this.props.controlsStore.editDesign;


        let helpPopover = <Popover id='help-designMap' title='Help'>
            <p>These are the controls for this design; a design comprises of
                all the components of a connection request except for the
                scheduling.</p>
            <p>A design is considered valid if it could potentially be reserved on the
                network with no other reservations present. The validity of the design
                is automatically checked when any change is made. </p>
            <p>If there are problems with the design, they will be flagged
                with red color on the design map and the component list, and will
                be listed through the "Display Design Issues" button.</p>
            <p>When a design is valid and a description is provided, then the
                "Save" button will be activated. A saved design can be loaded
                again in the future through the "Copy" link in the navigation menu.</p>
        </Popover>;



        let header = <div>Design controls
            <OverlayTrigger trigger='click' rootClose placement='top' overlay={helpPopover}>
                <Glyphicon className='pull-right' glyph='question-sign'/>
            </OverlayTrigger>
        </div>;


        return (
            <Panel header={header}>
                <Form inline={true}>
                    <FormGroup>
                        <FormControl type='text' placeholder='description'
                                     defaultValue={editDesign.description}
                                     onChange={this.onDescriptionChange}/>
                    </FormGroup>
                    {' '}
                    <FormGroup className='pull-right'>
                        <Button onClick={this.saveDesign}>Save</Button>
                    </FormGroup>
                </Form>

            </ Panel >
        );
    }
}