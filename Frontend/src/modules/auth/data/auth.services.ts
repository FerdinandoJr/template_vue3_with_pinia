export const authServices = {
    async login(email: string, password: string): Promise<{ token: string; user: any }> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === 'admin@datacrm.com' && password === 'admin') {
                    resolve({
                        token: 'mock-jwt-token-123456',
                        user: {
                            name: 'Usuário Administrador',
                            email,
                            role: 'ADMIN',
                            permissions: ['view_reports', 'manage_users', 'delete_tickets']
                        }
                    });
                } else if (email === 'atendente@datacrm.com' && password === '123') {
                    resolve({
                        token: 'mock-jwt-token-789012',
                        user: {
                            name: 'Atendente João',
                            email,
                            role: 'AGENT',
                            permissions: ['view_tickets', 'reply_chats']
                        }
                    });
                } else {
                    reject(new Error('Credenciais inválidas. Tente admin@datacrm.com ou atendente@datacrm.com'));
                }
            }, 800);
        });
    }
};
