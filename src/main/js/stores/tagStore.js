import { observable, action } from 'mobx';


class TagStore {

    @observable store = {
        categories: [],
    };

    @observable editTag = {
        contents: '',
        category: ''
    };

    @observable editCtg = {
        category: '',
        id: null
    };

    @action setEditedTagContents(contents) {
        this.editTag.contents = contents;
    }
    @action setEditedTagCtg(ctg) {
        this.editTag.category = ctg;
    }

    @action setEditedCtg(ctg, id) {
        this.editCtg.category = ctg;
        this.editCtg.id = id;
    }

    @action updateCategories(ctg) {
        this.store.categories = ctg;
    }
}
export default new TagStore();