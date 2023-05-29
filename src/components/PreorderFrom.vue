<script lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { useStore } from '../stores/store';
import { toast, type ToastOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import googlePlaces from '../composables/googlePlaces';
import axios from 'axios';
import { computed } from '@vue/reactivity';



export default {
  setup() {
    const variantRadios = document.querySelector('variant-radios');
    const priceDiv = document.getElementsByClassName("price--show-badge");
    const quantityDiv = document.getElementsByClassName("product-form__input product-form__quantity");
    const vendorDiv = document.getElementsByClassName('product__text inline-richtext caption-with-letter-spacing');
    const titleDiv = document.getElementsByClassName('product__title');
    const productInfoDiv = document.getElementsByClassName('product__info-container product__column-sticky');

    const store = useStore();
    const formData = reactive({
      name: '',
      email: '',
      phone: '',
      address: '',
      selectedVariantId: store.selectedVariantId,
      quantity: store.quantity
    });

    const addressList = ref({} as any);
    const addressInput = ref('');
    const phoneError = ref('');
    const emailError = ref('');

    watch(addressInput, (newValue, oldValue) => {
      if (newValue !== '') {
        formData.address = newValue;
        fetchAddressData(newValue);
      }
    });

    const fetchAddressData = (inputValue: string) => {
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

    const setAttributeOnCancel = () => {
      let variantFieldSets = variantRadios?.querySelectorAll('fieldset');
      variantFieldSets?.forEach((element) => {
        element.setAttribute("style", "display:block");
      })
      vendorDiv.item(0)?.setAttribute("style", "display:bloc");
      titleDiv.item(0)?.setAttribute("style", "display:block");
      priceDiv.item(0)?.setAttribute("style", "display:block");
      quantityDiv.item(0)?.setAttribute("style", "display:block");
      productInfoDiv.item(0)?.removeAttribute("style");
    }

    const handleCancel = () => {
      store.setIsShowForm(false);
      store.setIsShowButton(true);
      setAttributeOnCancel();
    }

    const validateEmail = () => {
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      const email = formData.email.trim();

      if (!emailRegex.test(email) && formData.email !== '') {
        emailError.value = 'Please enter a valid email.';
      } else {
        emailError.value = ''; // Clear error message
      }
    }


    const validatePhone = () => {
      const phoneRegex = /^(\+?\d{1,3})?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/;
      const phoneNumber = formData.phone.trim();

      if (!phoneRegex.test(phoneNumber) && formData.phone !== '') {
        phoneError.value = 'Please enter a valid phone number.';
      } else {
        phoneError.value = ''; // Clear error message
      }
    }

    const isDisableSubmission = computed(() => {
      return !!phoneError.value || !!emailError.value;
    })



    const submitForm = () => {
      axios.post('https://localhost:5901/api/sdk/preorders', formData).then(
        (res) => {
          console.log(res);
        }
      )
        .catch((error) => {
          console.error(error);
        })
      console.log(formData);
      store.setIsLoading(true);
      store.setIsShowForm(false);
      setTimeout(() => {
        store.setIsLoading(false);
        store.setIsSubmitted(true);
      }, 3000);
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    }

    return {
      store,
      formData,
      addressList,
      addressInput,
      phoneError,
      emailError,
      isDisableSubmission,
      validatePhone,
      validateEmail,
      handleCancel,
      submitForm,
      fetchAddressData
    };
  },
};
</script>

<template>
  <form class="form-container" @submit.prevent="submitForm">
    <button @click="handleCancel" style="margin-left: 400px; background-color: red;">
      X
    </button>
    <h2 class="form-title">Pre-order Form</h2>
    <div class="form-group">
      <label for="name">Name</label>
      <input type="text" id="name" v-model="formData.name" placeholder="Enter your name" required>
    </div>
    <div class="form-group">
      <label for="email">Email</label>
      <input type="email" id="email" v-model="formData.email" placeholder="Enter your email" @blur="validateEmail"
        required>
    </div>
    <div class="error-msg" v-if="emailError">{{ emailError }}</div>
    <div class="form-group">
      <label for="phone">Phone</label>
      <input type="tel" id="phone" v-model="formData.phone" placeholder="Enter your phone number" @blur="validatePhone"
        required>
    </div>
    <div class="error-msg" v-if="phoneError">{{ phoneError }}</div>
    <div class="form-group">
      <label for="address">Address:</label>
      <input type="input" id="address" v-model="addressInput" placeholder="Search for a address.." autocomplete="off"
        list="suggestions" required />
      <datalist id="suggestions">
        <option v-for="suggestion in addressList.features" :value="suggestion.properties.formatted">
        </option>
      </datalist>
      <br>
      <div>
        <span>
          Order Quantity:{{ store.quantity }}
        </span>
      </div>
    </div>
    <button :disabled="isDisableSubmission" type="submit" class="pre-order-btn">Pre-order</button>
  </form>
</template>
  
<style></style>