import { defineStore } from "pinia";

export const useStore = defineStore({
    id: "store",
    state: () => {
        return {
            isDisable:false,
            isSubmitted: false,
            isLoading: false,
            isShowForm: false,
            selectedVariantId: '',
            productId: 0,
            quantiy: 1,
            status: 1,
            stock: 1,
            inventory: 0,
        };

    },

    actions: {
        setIsDisable(isDisable: boolean){
            this.isDisable = isDisable;
        },
        setIsSubmitted(isSubmitted: boolean) {
            this.isSubmitted = isSubmitted;
        },
        setIsLoading(isLoading: boolean) {
            this.isLoading = isLoading;
        },
        setIsShowForm(isShowForm: boolean) {
            this.isShowForm = isShowForm;
        },
        setQuantity(quantity: number) {
            this.quantiy = quantity;
        },
        setStatus(status: number) {
            this.status = status;
        },
        setStock(stock: number) {
            this.stock = stock;
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