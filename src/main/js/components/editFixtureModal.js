import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button} from 'react-bootstrap';

import EditFixtureForm from './editFixtureForm';

const modalName = 'editFixture';

@inject('controlsStore', 'sandboxStore')
@observer
export default class EditFixtureModal extends Component {
    constructor(props) {
        super(props);
    }


    closeModal = () => {
        this.props.controlsStore.closeModal(modalName);
    };

    render() {
        let showModal = this.props.controlsStore.modals.get(modalName);
        let fixture = this.props.controlsStore.fixture;

        let label =  'Error - fixture not found!';
        if (fixture !== null) {
            label =  fixture.label;
        }


        return (
            <div>
                <Modal bsSize='large' show={showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{label}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <EditFixtureForm closeModal={this.closeModal} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}