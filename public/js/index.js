import '@babel/polyfill'
import { login, logout } from './login'
import { getMapbox } from './mapbox';

const map = document.getElementById('map')
const loginForm = document.querySelector('form')

const logoutBtn = document.querySelector('.nav__el--logout')

if(map) {
    const locations = JSON.parse(map.dataset.locations);
    getMapbox(locations)
}

if(loginForm){
    document.querySelector('form').addEventListener("submit",e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password)
    })
}

if(logoutBtn) logoutBtn.addEventListener("click", logout)