import { ref } from 'vue';
import { cepService } from '@/core/services/cep.service';
import { ElMessage } from 'element-plus';

export function useCepLocator() {
    const loadingCep = ref(false);

    
    const formatAndSearchCep = async (
        val: string, 
        onComplete?: (address: string) => void
    ): Promise<string> => {
        let v = val.replace(/\D/g, '');
        if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, '$1-$2');

        if (v.length === 9) {
            const cleanCep = v.replace('-', '');
            loadingCep.value = true;
            try {
                const address = await cepService.getAddressByCep(cleanCep);
                const fullAddress = `${address.logradouro}, ${address.bairro}, ${address.cidade} - ${address.uf}`;
                ElMessage.success('Endereço preenchido!');
                if (onComplete) {
                    onComplete(fullAddress);
                }
            } catch (error) {
                ElMessage.warning('CEP não encontrado');
            } finally {
                loadingCep.value = false;
            }
        }
        
        return v;
    };

    return {
        loadingCep,
        formatAndSearchCep
    };
}
