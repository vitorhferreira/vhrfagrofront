import { jwtDecode } from "jwt-decode";

export const verificaTokenExpirado = (token: string | undefined) => {
    try {
        if (token) {
            console.log('Token:', token); // Debug: Verifique o token antes de decodificar
            let decodedToken = jwtDecode(token);

            if (decodedToken != null && decodedToken?.exp) {
                if (decodedToken.exp < new Date().getTime() / 1000) {
                    // Token Expirado
                    return true;
                }
                return false;
            }
            return false;
        }
        return true;
    } catch (error) {
        console.error('Erro ao decodificar o token JWT:', error);
        // Lide com o erro de decodificação aqui
        return false; // Ou outro tratamento adequado
    }
};

export const verificaLogado = () => {
    
}

export const validaPermissao = (
    token: string | undefined,
    permissao: Array<string>
) => {
    try {
        if (token) {
            console.log('Token:', token); // Debug: Verifique o token antes de decodificar
            const user = jwtDecode<{ permissoes: string }>(token);

            if (typeof user.permissoes === 'string') {
                const temAlgumaPermissaoTIO = permissao.includes(user.permissoes);
                return temAlgumaPermissaoTIO;
            }
            return false;
        }
        return true;
    } catch (error) {
        console.error('Erro ao decodificar o token JWT:', error);
        // Lide com o erro de decodificação aqui
        return false; // Ou outro tratamento adequado
    }
};
