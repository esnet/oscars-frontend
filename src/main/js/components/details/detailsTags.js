import React, {Component} from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Label,
    Input,
    Form,
    InputGroup,
    InputGroupAddon
} from 'reactstrap';
import {observer, inject} from 'mobx-react';
import {action} from 'mobx';
import {size} from 'lodash-es';

import Select from 'react-select-plus';
import BootstrapTable from 'react-bootstrap-table-next';
import Octicon from 'react-octicon'


import myClient from '../../agents/client';
import ConfirmModal from '../confirmModal';

@inject('tagStore', 'connsStore')
@observer
export default class DetailsTags extends Component {

    constructor(props) {
        super(props);

    }

    componentWillMount() {
        this.refreshTagCategories();
    }

    componentWillUnmount() {
        clearTimeout(this.tagUpdateTimeout);
    }

    refreshTagCategories = () => {
        myClient.submitWithToken('GET', '/protected/tag/categories')
            .then(
                action((response) => {
                    let parsed = JSON.parse(response);
                    this.props.tagStore.updateCategories(parsed);

                }));
        this.tagUpdateTimeout = setTimeout(this.refreshTagCategories, 20000);
    };

    refreshTags = () => {
        this.props.connsStore.refreshCurrent();
    };


    // key presses
    handleKeyPress = (e) => {
        const edit = this.props.tagStore.editTag;
        if (e.key === 'Enter' && size(edit.category) > 0 && size(edit.contents)) {
            this.add();
        }
    };

    onCategoryChange = (val) => {
        console.log('category changed ' + val);
        this.props.tagStore.setEditedTagCtg(val);

    };

    onContentsChange = (val) => {
        this.props.tagStore.setEditedTagContents(val);
    };

    delete = (id) => {
        const connId = this.props.connsStore.store.current.connectionId;
        myClient.submitWithToken('GET', '/protected/tag/delete/' + connId + '/' + id)
            .then(
                action(() => {
                    this.refreshTags();
                }));

    };

    add = () => {
        const connId = this.props.connsStore.store.current.connectionId;
        const edit = this.props.tagStore.editTag;
        let tag = {
            id: null,
            category: edit.category,
            contents: edit.contents
        };

        myClient.submitWithToken('POST', '/protected/tag/add/' + connId, tag)
            .then(
                action(() => {
                    this.refreshTags();
                }));

    };

    idFormatter = (cell, row) => {
        return <Octicon name='trashcan'
                        onClick={() => this.delete(row.id)}
                        className='float-right'
                        style={{height: '16px', width: '16px'}}/>
        /* we don't need confirmations
        return <ConfirmModal
            body='This will delete the tag.'
            header='Delete tag'
            uiElement={<Octicon name='trashcan' className='float-right' style={{height: '16px', width: '16px'}}/>}
            onConfirm={() => this.delete(row.id)}/>
            */
    };

    render() {
        const edit = this.props.tagStore.editTag;

        let tags = [];
        if (this.props.connsStore.store.current.tags != null) {
            this.props.connsStore.store.current.tags.map(t => {
                tags.push({
                    id: t.id,
                    contents: t.contents,
                    category: t.category
                })
            })
        }
        let categoryOpts = [];
        this.props.tagStore.store.categories.map(c => {
            categoryOpts.push({
                'value': c.category,
                'label': c.category,
            })
        });

        const columns = [
            {
                dataField: 'category',
                text: 'Category',
            },
            {
                dataField: 'contents',
                text: 'Contents',
            },
            {
                dataField: 'id',
                text: '?',
                formatter: this.idFormatter,
                headerStyle: {width: '40px', textAlign: 'center'}
            },

        ];
        const ctgValue = edit.category;

        return (
            <Card>
                <CardHeader>Tags</CardHeader>
                <CardBody>
                    <BootstrapTable condensed keyField='id' data={tags} columns={columns}/>

                    <Form inline onSubmit={(e) => {
                        e.preventDefault()
                    }}>
                        <InputGroup className='mb-2 mr-sm-2 mb-sm-0'>
                            <small>
                                <Select style={{width: '100px'}}
                                        name='select-category'
                                        placeholder='Category'
                                        simpleValue
                                        onBlurResetsInput={false}
                                        onChange={this.onCategoryChange}
                                        value={ctgValue}
                                        autosize={false}
                                        options={categoryOpts}/>
                            </small>
                            <Input type='text' id='contents'
                                   bsSize='sm'
                                   placeholder='Contents'
                                   onKeyPress={this.handleKeyPress}
                                   onChange={(e) => this.onContentsChange(e.target.value)}/>
                        <InputGroupAddon addonType='append'>
                            <Button className='float-right btn-sm'
                                    disabled={size(edit.category) === 0 || size(edit.contents) === 0}
                                    onClick={this.add}>Add</Button>
                        </InputGroupAddon>
                        </InputGroup>
                    </Form>
                </CardBody>

            </Card>
        );
    }

}
