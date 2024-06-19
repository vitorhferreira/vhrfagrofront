import { jwtDecode } from "jwt-decode";

export const verificaTokenExpirado =
    (token: string | undefined) => {
        if (token) {
            let decodedToken = jwtDecode(token)

            if (decodedToken != null && decodedToken?.exp) {
                if (decodedToken.exp < new Date().getTime() / 1000) {
                    // Token Expirado
                    return true
                }
                return false
            }
            return false
        }
        return true
    }

export const validaPermissao = (
    token: string | undefined,
    permissao: Array<string>
) => {
    if (token) {
        const user = jwtDecode<{ permissoes: string }>(token)

        if (typeof user.permissoes === 'string') {
            const temAlgumaPermissaoTIO =
                permissao.includes(user.permissoes)

            return temAlgumaPermissaoTIO
        }
        return false
    }
    return true
}