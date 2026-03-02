export const authServices = {
    async login(email: string, password: string): Promise<{ token: string; user: any }> {
        return new Promise((resolve, reject) => {
            // Simulando delay da rede (API real)
            setTimeout(() => {
                // Credenciais chumbadas para o teste
                if (email === 'admin@datacrm.com' && password === 'admin') {
                    resolve({
                        token: 'mock-jwt-token-123456',
                        user: { name: 'Usuário Administrador', email }
                    });
                } else {
                    reject(new Error('Credenciais inválidas. Tente admin@datacrm.com e admin'));
                }
            }, 800);
        });
    }
};