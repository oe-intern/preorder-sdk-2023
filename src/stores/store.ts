import { defineStore } from "pinia";

export const useStore = defineStore({
    id: "store",
    state: () => {
        return {
            isDisable: false,
            isSubmitted: false,
            isShowButton: false,
            isLoading: false,
            isShowForm: false,
            selectedVariantId: '',
            productId: 0,
            quantity: 1,
            status: 1,
            inventory: 0
        };

    },

    actions: {
        setIsDisable(isDisable: boolean) {
            this.isDisable = isDisable;
        },
        setIsSubmitted(isSubmitted: boolean) {
            this.isSubmitted = isSubmitted;
        },
        setIsShowButton(isShowButton: boolean) {
            this.isShowButton = isShowButton;
        },
        setIsLoading(isLoading: boolean) {
            this.isLoading = isLoading;
        },
        setIsShowForm(isShowForm: boolean) {
            this.isShowForm = isShowForm;
        },
        setQuantity(quantity: number) {
            this.quantity = quantity;
        },
        setStatus(status: number) {
            this.status = status;
        },
        setInventory(inventory: number) {
            this.inventory = inventory;
        },
        setProductId(productId: number) {
            this.productId = productId;
        },
        setSelectedVariantId(selectedVariantId: string) {
            this.selectedVariantId = selectedVariantId;
        }
    },
})