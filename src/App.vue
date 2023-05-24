<script lang="ts">
import PreorderFrom from './components/PreorderFrom.vue';
import { onMounted, ref, watch, watchEffect } from 'vue';
import { useStore } from './stores/store';
import { onBeforeRouteUpdate } from 'vue-router';
import axios from 'axios';
export default {
    name: "App",
    setup() {
        var store = useStore();
        var quantity: number;
        var getVariant = ref({} as any)
        const isInStock = (window as any).isInStock;
        const getVariantParam = ref('')
        const urlParams = new URL(window.location.href)
        const variantDiv = document.getElementsByClassName('js product-form__input');
        const priceDiv = document.getElementsByClassName("price--show-badge");
        const quantityDiv = document.getElementsByClassName("product-form__input product-form__quantity");
        const vendorDiv = document.getElementsByClassName('product__text inline-richtext caption-with-letter-spacing');
        const titleDiv = document.getElementsByClassName('product__title');
        const productInfoDiv = document.getElementsByClassName('product__info-container product__column-sticky');
        const quantityInput = document.getElementsByClassName('quantity__input').item(0) as HTMLInputElement
        const radiosTag = document.getElementsByTagName('variant-radios').item(0)
        const radios = radiosTag?.getElementsByTagName('input');
        const formButtons = document.getElementsByClassName("product-form__buttons");

        store.setProductId((window as any).ShopifyAnalytics.meta.product.id);
        setTimeout(() => {
            store.setSelectedVariantId((window as any).ShopifyAnalytics.meta.selectedVariantId);
        }, 2000);

        const watchUrl = (callback: any) => {
            let oldValue = urlParams.searchParams.get('variant');
            setInterval(() => {
                const newValue = urlParams.searchParams.get('variant');
                if (newValue !== oldValue) {
                    callback(newValue, oldValue);
                    oldValue = newValue;
                    window.history.replaceState(null, '', urlParams.toString());
                }
            }, 100); // Check every 100 milliseconds
        };

        const dateCheck = (date_start: any, date_end: any) => {
            const today = new Date()
            return today >= date_start.value && today <= date_end.value
        }

        const quantityCheck = (quantityValue: string) => {
            if (Number(quantityValue) > getVariant.value.stock) {
                quantity = Number(getVariant.value.stock);
            }
            else if (Number(quantityValue) < 1 || isNaN(Number(quantityValue))) {
                quantity = 1
            }
            else {
                quantity = Number(quantityValue)
            }
        }

        const setAttributesOnClick = () => {
            if (variantDiv && priceDiv && quantityDiv && vendorDiv && titleDiv && productInfoDiv) {
                variantDiv.item(0)?.setAttribute("style", "display:none");
                productInfoDiv.item(0)?.setAttribute('style', 'width:500px');
                vendorDiv.item(0)?.setAttribute("style", "display:none");
                titleDiv.item(0)?.setAttribute("style", "display:none");
                priceDiv.item(0)?.setAttribute("style", "display:none");
                quantityDiv.item(0)?.setAttribute("style", "display:none");
            }
        }


        watchUrl((newValue: any, oldValue: any) => {
            getVariantParam.value = newValue;
        });

        onMounted(() => {
            axios.get(`https://localhost:5901/api/sdk/active/${store.productId}`).then(
                res => {
                    console.log(res.data);
                    const date_start = ref(new Date(res.data.date_start));
                    const date_end = ref(new Date(res.data.date_end));
                    const isValidDate = dateCheck(date_start, date_end)
                    if (isInStock && res.data.status === 1 && isValidDate) {
                        if (radios) {
                            for (let i = 0; i < radios.length; i++) {
                                radios[i].addEventListener("change", function () {
                                    if (this.checked) {
                                        const selectedVariant = this.value;
                                        getVariant.value = res.data.variants.find((element: any) =>
                                            element.title_var === selectedVariant
                                        );
                                        if (getVariant.value.stock === 0) {
                                            store.setIsDisable(true);
                                        }
                                        else {
                                            store.setIsDisable(false);
                                            setTimeout(() => {
                                                quantityInput.setAttribute("max", `${getVariant.value.stock}`);
                                            }, 2000);
                                        }

                                    }
                                });
                            }
                        }
                        if (quantityInput && formButtons) {
                            setTimeout(() => {
                                getVariant.value = res.data.variants.find((element: any) =>
                                    element.id === parseInt(store.selectedVariantId)
                                );
                                console.log(getVariant.value)

                                if (getVariant.value.stock === 0) {
                                    store.setIsDisable(true);
                                }
                                else {
                                    quantityInput.setAttribute("max", `${getVariant.value.stock}`);
                                }
                            }, 2000);
                            formButtons.item(0)?.setAttribute("style", "display:none");
                        }
                        store.setIsShowButton(true)
                    }
                }
            );
        })


        const handleClick = () => {
            store.setIsShowForm(true);
            store.setIsShowButton(false);
            if (quantityInput) {
                quantityCheck(quantityInput.value)
            }
            store.setQuantity(quantity);
            setAttributesOnClick();
        }

        return {
            store,
            getVariant,
            getVariantParam,
            handleClick
        };
    },
    components: { PreorderFrom }
}



</script>

<template>
    <div>

        <div class="loading-overlay" v-if="store.isLoading">
            <div class="spinner"></div>
            <div>Placing your pre-order...</div>
        </div>


        <!-- Show success message or form results -->
        <div v-if="!store.isLoading && store.isSubmitted">
            <span style="color: #228B22;font-size: 25px;">
                Your Pre-order have been placed!
            </span>
        </div>

        <!-- <div>
                            <Span>You can't add a quantity more than the variant stock!</Span>
                        </div> -->

        <span v-if="store.isShowButton">
            {{ getVariant.stock }} items left for pre-order.
        </span>
        <button v-if="store.isShowButton" class="shopify-payment-button__button shopify-payment-button__button--unbranded"
            id="pre-order-btn" style="background-color: red;" @click="handleClick" :disabled="store.isDisable">
            Pre-order Now
        </button>

        <PreorderFrom v-if="store.isShowForm"></PreorderFrom>



    </div>
</template>

<style></style>
