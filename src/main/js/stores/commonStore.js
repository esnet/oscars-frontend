import { observable, action } from 'mobx';


class CommonStore {

    @observable nav = {
        active: '',
    };

    @action setActiveNav(a) {
        this.nav.active = a;
    }


}
export default new CommonStore();