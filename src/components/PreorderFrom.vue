<script lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { useStore } from '../stores/store';
import { toast, type ToastOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import googlePlaces from '../composables/googlePlaces';
import axios from 'axios';



export default {
  setup() {
    const store = useStore();
    const formData = reactive({
      name: '',
      email: '',
      phone: '',
      address: '',
      selectedVariantId: store.selectedVariantId,
      quantity: store.quantiy
    });

    const addressList = ref({} as any);
    const addressInput = ref('');

    watch(addressInput, (newValue, oldValue) => {
      if (newValue !== '') {
        formData.address = newValue;
        fetchAddressDate(newValue);
      }
    });

    const fetchAddressDate = (inputValue: string) => {
      axios.get(`https://api.geoapify.com/v1/geocode/autocomplete?text=${inputValue}&apiKey=2c7b916c62724a48893851d7d9a37956`)
        .then(response => {
          addressList.value = response.data;

          // Access .value here
          addressList.value.features.forEach((element: any) => {
            console.log(element.properties.formatted);
          });
        })
        .catch(error => {
          console.log(error);
        });
    }

    const submitForm = () => {
      axios.post('https://localhost:5901/api/sdk/preorders', formData);
      console.log(formData);
      store.setIsLoading(true);
      store.setIsShowForm(false);
      setTimeout(() => {
        store.setIsLoading(false);
        store.setIsSubmitted(true);
      }, 3000);
      // setTimeout(() => {
      //   window.location.reload();
      // }, 6000);
    }

    return {
      store,
      formData,
      addressList,
      addressInput,
      submitForm,
      fetchAddressDate
    };
  },
};
</script>

<template>
  <form class="form-container" @submit.prevent="submitForm">
    <div class="form-group">
      <label for="name">Name</label>
      <input type="text" id="name" v-model="formData.name" placeholder="Enter your name">
    </div>
    <div class="form-group">
      <label for="email">Email</label>
      <input type="email" id="email" v-model="formData.email" placeholder="Enter your email">
    </div>
    <div class="form-group">
      <label for="phone">Phone</label>
      <input type="tel" id="phone" v-model="formData.phone" placeholder="Enter your phone number">
    </div>
    <div class="form-group">
      <label for="address">Address:</label>
      <input type="input" id="address" v-model="addressInput" placeholder="Search for a address.." autocomplete="off"
        list="suggestions" />
      <datalist id="suggestions">
        <option v-for="suggestion in addressList.features" :value="suggestion.properties.formatted">
        </option>
      </datalist>
    </div>
    <br>
    <button type="submit">Pre-order</button>
  </form>
</template>
  
<style></style>