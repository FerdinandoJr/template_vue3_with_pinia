import { ref, onMounted } from 'vue';
import { useCustomerStore } from '../store/customer.store';
import type { ICustomer, IContactPerson } from '../../domain/entities/customer';
import { useToast } from '@/core/composables/useToast';

export function useCustomerDetails(customerId: string) {
    const store = useCustomerStore();
    const { showToast } = useToast();

    const customer = ref<ICustomer | null>(null);
    const isLoading = ref(true);

    const loadCustomer = async () => {
        isLoading.value = true;
        try {
            const result = await store.fetchById(customerId);
            customer.value = result || null;
        } catch (error) {
            showToast('Erro ao carregar os dados do cliente.', 'error');
        } finally {
            isLoading.value = false;
        }
    };

    const updateMainData = async (data: Partial<ICustomer>) => {
        if (!customer.value) return;
        try {
            await store.updateCustomer(customer.value.uuid, data);
            await loadCustomer();
        } catch (error) {
            showToast('Erro ao atualizar os dados.', 'error');
        }
    };

    const saveContact = async (contactData: IContactPerson, index: number | null) => {
        if (!customer.value) return;

        const currentContacts = [...(customer.value.additionalContacts || [])];

        if (index !== null) {
            currentContacts[index] = contactData;
        } else {
            currentContacts.push(contactData);
        }

        try {
            await store.updateCustomer(customer.value.uuid, { additionalContacts: currentContacts });
            customer.value.additionalContacts = currentContacts;
            showToast('Contato salvo com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao salvar contato.', 'error');
        }
    };

    // Removido o confirm() nativo daqui! A confirmação será visual na tela agora.
    const removeContact = async (index: number) => {
        if (!customer.value) return;

        const currentContacts = [...(customer.value.additionalContacts || [])];
        currentContacts.splice(index, 1);

        try {
            await store.updateCustomer(customer.value.uuid, { additionalContacts: currentContacts });
            customer.value.additionalContacts = currentContacts;
            showToast('Contato removido!', 'success');
        } catch (error) {
            showToast('Erro ao remover contato.', 'error');
        }
    };

    onMounted(() => {
        loadCustomer();
    });

    return {
        customer,
        isLoading,
        updateMainData,
        saveContact,
        removeContact
    };
}