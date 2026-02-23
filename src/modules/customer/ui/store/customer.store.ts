import { customerServices } from "../../data/customer.services"
import { defineStore } from "pinia"
import type { ICustomer } from "../../domain/entities/customer"
import type { CustomerFilter } from "../../data/customer.services"

interface CustomerState {
    total: number
    filteredTotal: number
    items: ICustomer[]
    filter: CustomerFilter
    loading: boolean
    _fecthPromise: Promise<void> | null
}

export const useCustomerStore = defineStore('customer', {
    state: (): CustomerState => ({
        items: [],
        total: 0,
        filteredTotal: 0,
        loading: false,
        _fecthPromise: null,
        filter: {}
    }),
    actions: {
        async fetch() {
            this.loading = true

            this._fecthPromise = (async () => {
                try {
                    const { total, filteredTotal, items } = await customerServices.list(this.filter)
                    this.total = total
                    this.filteredTotal = filteredTotal
                    this.items = items
                } catch (error) {
                    console.error(error)
                } finally {
                    this.loading = false
                }
            })()

            return this._fecthPromise
        },

        async fetchById (uuid: string) {
            this.loading = true

            try {
                const customer = await customerServices.getById(uuid)
                return customer
            } catch (error) {
                console.error(error)
                return null
            } finally {
                this.loading = false
            }
        }
    }
})