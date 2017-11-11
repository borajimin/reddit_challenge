const axios = require('axios');

function rootReducer(state = {
    name: 'Horizons',
    isModalOpen: false,
    description: "something",
    loggedIn: '',
    signUp: false}, action) {
    switch (action.type) {
        case "TOGGLE_LOGIN_MODAL":
            return Object.assign({}, state, {isModalOpen: !state.isModalOpen});
        case "LOGIN":
            axios.post('http://localhost:3000/api/login', {
                username: action.username,
                password: action.password
            })
            .then((response) => {
              console.log('response: ', response.data);
                return Object.assign({}, state, {loggedIn: action.username});
            })
            .catch(err => {
                console.log(err);
                return state;
            });
            break;
        case "REGISTER":
            console.log('registering..', action);
            axios.post('http://localhost:3000/api/register', {
                username: action.username,
                password: action.password,
                repeatPassword: action.rPassword
            })
            .then(() => Object.assign({}, state))
            .catch(err => {
                console.log(err);
                return state;
            });
        case "SIGN_UP":
            return Object.assign({}, state, {signUp: !state.signUp});
        case "LOG_OUT":
            axios.get('http://localhost:3000/api/logout')
            .then((response) => {
              console.log('response: ', response.data);
                return Object.assign({}, state, {loggedIn: ''});
            })
            .catch(err => {
                console.log(err);
                return state;
            });
            break;
        default:
            return state;
    }
}

export default rootReducer;
