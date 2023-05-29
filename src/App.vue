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
        var getVariant = ref({} as any);
        var selectedVariant = ref('');
        const isInStock = (window as any).isInStock;
        const getVariantParam = ref('');
        const urlParams = new URL(window.location.href)
        const priceDiv = document.getElementsByClassName("price--show-badge");
        const quantityDiv = document.getElementsByClassName("product-form__input product-form__quantity");
        const vendorDiv = document.getElementsByClassName('product__text inline-richtext caption-with-letter-spacing');
        const titleDiv = document.getElementsByClassName('product__title');
        const productInfoDiv = document.getElementsByClassName('product__info-container product__column-sticky');
        const quantityInput = document.getElementsByClassName('quantity__input').item(0) as HTMLInputElement
        const variantRadios = document.querySelector('variant-radios');
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

        const isDateInRange = (startDate: any, endDate: any) => {
            return new Date() >= startDate && new Date() <= endDate;
        }


        const quantityCheck = (quantityValue: string) => {
            let notifiText = document.getElementById('notifi-text');
            if (Number(quantityValue) > getVariant.value.stock) {
                store.setIsDisable(true);
                if (notifiText) {
                    console.log(notifiText.textContent);
                    notifiText.textContent = " ⚠ You cannot add a quantity more than the variant stock! "
                }
            }
            else if (Number(quantityValue) < 1 || isNaN(Number(quantityValue))) {
                store.setIsDisable(true);
                if (notifiText) {
                    notifiText.textContent = " ⚠ Invalid quantity! "
                }
            }
            else {
                store.setIsDisable(false);
                if (notifiText) {
                    notifiText.textContent = " "
                }
                quantity = Number(quantityValue)
            }
        }

        const hideVariantFieldsets = () => {
            const variantFieldsets = variantRadios?.querySelectorAll('fieldset');
            variantFieldsets?.forEach((fieldset) => {
                fieldset.style.display = 'none';
            });
        };

        const setProductInfoDivWidth = () => {
            productInfoDiv.item(0)?.setAttribute('style', 'width:500px');
        };

        const hideVendorTitlePriceQuantityDivs = () => {
            vendorDiv.item(0)?.setAttribute('style', 'display:none');
            titleDiv.item(0)?.setAttribute('style', 'display:none');
            priceDiv.item(0)?.setAttribute('style', 'display:none');
            quantityDiv.item(0)?.setAttribute('style', 'display:none');
        };

        const setAttributesOnClick = () => {
            if (priceDiv && quantityDiv && vendorDiv && titleDiv) {
                hideVariantFieldsets();
                setProductInfoDivWidth();
                hideVendorTitlePriceQuantityDivs();
            }
        };


        function handleRadioChange(variantsArray: any) {
            setTimeout(() => {
                store.setSelectedVariantId((window as any).ShopifyAnalytics.meta.selectedVariantId);
            }, 2000);
            if (variantRadios) {
                const radioInputs = variantRadios.querySelectorAll('input[type="radio"]:checked');
                selectedVariant.value = Array.from(radioInputs)
                    .filter((input) => input instanceof HTMLInputElement)
                    .map((input) => (input as HTMLInputElement).value)
                    .join(' / ');

                if (selectedVariant.value) {
                    getVariant.value = variantsArray.find((element: any) =>
                        element.title_var === selectedVariant.value
                    );
                    console.log(getVariant.value)
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
            }
        }

        const handleClick = () => {
            store.setIsShowForm(true);
            store.setIsShowButton(false);
            if (quantityInput) {
                quantityCheck(quantityInput.value)
            }
            store.setQuantity(quantity);
            setAttributesOnClick();
        }

        watchUrl((newValue: any, oldValue: any) => {
            getVariantParam.value = newValue;
        });

        onMounted(() => {
            axios.get(`https://localhost:5901/api/sdk/active/${store.productId}`).then(
                response => {
                    console.log(response.data);
                    const dateStart = new Date(response.data.date_start);
                    const dateEnd = new Date(response.data.date_end);
                    const isValidDate = isDateInRange(dateStart, dateEnd)
                    const variantsArray = response.data.variants;
                    if (isInStock && response.data.status === 1 && isValidDate) {
                        variantRadios?.addEventListener('change', function () {
                            handleRadioChange(variantsArray);
                        });
                        if (quantityInput && formButtons) {
                            quantityInput.addEventListener("change", function () {
                                quantityCheck(quantityInput.value);
                            })
                            setTimeout(() => {
                                getVariant.value = response.data.variants.find((element: any) =>
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

        <div v-if="!store.isShowForm">
            <span id="notifi-text" style="color:#ff0000;"></span>
        </div>

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
