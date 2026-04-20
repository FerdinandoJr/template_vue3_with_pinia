import { ref } from 'vue';
import { cepService } from '@/core/services/cep.service';
import { ElMessage } from 'element-plus';

export function useCepLocator() {
    const loadingCep = ref(false);

    /**
     * Formata o CEP (adicionando o hífen) e se completar 9 caracteres,
     * busca automaticamente o endereço via ViaCEP.
     * @param val O valor digitado pelo usuário no input
     * @param onComplete Callback chamado quando o endereço é encontrado com sucesso.
     * @returns A string do CEP já formatada para atualizar o model
     */
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
