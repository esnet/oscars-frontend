import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button} from 'react-bootstrap';

import FixtureParamsForm from './fixtureParamsForm';

@inject('sandboxStore')
@observer
export default class FixtureParamsModal extends Component {
    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
    }


    closeModal() {
        this.props.sandboxStore.closeModal('fixture');
    }
    

    render() {
        let fixture = this.props.sandboxStore.selection.fixture;
        let showModal = this.props.sandboxStore.modals.get('fixture');

        return (
            <div>
                <Modal show={showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{fixture}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <FixtureParamsForm modal='fixture'/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>


            </div>
        );
    }
}