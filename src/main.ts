import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from "pinia";
import Vue3Toasity, { type ToastContainerOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import AppConfig from './config/app'

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(Vue3Toasity,
    {
        autoClose: 2000,
    } as ToastContainerOptions);

const id = AppConfig.ELEMENT_ID;
const existApp = document.getElementById(id);

if (!existApp) {
    const newApp = document.createElement('div');
    newApp.setAttribute('id', id);
    // place it at under of the product form buttons
    var formBtn = document.getElementsByClassName('product-form__buttons');
    if (formBtn) {
        formBtn.item(0)?.after(newApp);
    }
}
app.mount(`#${AppConfig.ELEMENT_ID}`);

