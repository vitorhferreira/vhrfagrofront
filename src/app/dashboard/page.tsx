import { LayoutDashboard } from "@/components/LayoutDashboard";
import { cookies } from 'next/headers'
import { redirect } from "next/navigation";
import { verificaTokenExpirado } from "@/services/token";

export default function Dashboard() {

    const cookie = cookies();

    const token = cookie.get('painel1pitchau.token')

    if (!token?.value || verificaTokenExpirado(token.value)) {
        redirect('/login')
    }    

    console.log("Rapha console")
    return(
        <LayoutDashboard
            token={token.value}
        >
            <h1>D Saude</h1>
        </LayoutDashboard>
    )
}