// 'use client'
import { LayoutDashboard } from "@/components/LayoutDashboard";
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import { verificaTokenExpirado } from "@/services/token";
import Carousel from 'react-bootstrap/Carousel';    

export default function Dashboard({searchParams} : {searchParams: {id: string}}) {
    const cookie = cookies();
    const token = cookie.get('painel1pitchau.token');
    // return
    if (!token?.value || verificaTokenExpirado(token.value)) {
        redirect('/login');
        return null; // Para evitar renderizar conteúdo se não autenticado
    }

    return (
        <>
        <LayoutDashboard token={token.value}>
            <div className="container-fluid">
                <div className="row">
                    <main className="col-md-12 ms-sm-auto col-lg-10 px-md-4 d-flex flex-column">
                        <div className="my-4">
                            {/* Imagem acima dos depoimentos */}
                            <img
                                src="https://lh5.googleusercontent.com/WRqiXPOZQzsbgwmdz0-Z5dZ-sEkrfAioa-8cloG8lJjLQjZ0jlp6E472ZGBeu10Adf9oynORdpJRIoN62CY4xZ-F2gb8h3xsJViSfuzwnzTzr8mt2qZAX7JELwHPngacSA=w1280" // URL da imagem desejada
                                alt="Imagem de destaque"
                                className="img-fluid mb-4"
                            />
                            
                            <iframe jsname="L5Fo6c" class="YMEQtf KfXz0b" sandbox="allow-scripts allow-popups allow-forms allow-same-origin allow-popups-to-escape-sandbox allow-downloads allow-modals allow-storage-access-by-user-activation" frameborder="0" aria-label="Calendar, Atividades e Eventos" src="https://www.google.com/calendar/embed?color=%23a47ae2&amp;deb=-&amp;embed_style=WyJhdDplbWI6c3QiLCIjZTBlMGUwIiwiI2VkZWRlZCIsIiM0MTg0ZjMiLCJyb2JvdG8iLCIjNjM2MzYzIiw1MDAsIiNmZmYiXQo&amp;eopt=0&amp;mode=agenda&amp;showCalendars=1&amp;showPrint=0&amp;showTz=0&amp;src=c_102db2ba29a0536d02c7b45fb5fd19925752c569d086e200a82728a51c3077e1@group.calendar.google.com" allowfullscreen=""></iframe>
                            <img src="https://lh4.googleusercontent.com/y8ACsMd5rPvQ3NTP3AIEC-JsnIY0duka7sqnd5qRZSIB2zyRCIO3LahheI-2ZDYo4W8MR7Vpwp5rHxfmRMPCgRgb5oDYXmXLbQemFfgTvvwKJzbOH8fJzGZzvZHq7exgDw=w1280" class="CENy8b"></img>
                            <h2 className="mb-4">Depoimentos e Casos de Sucesso:</h2>
                            <div className="card mb-4">
                                <div className="card-body">
                                    <h3 className="card-title">Depoimentos de Pacientes:</h3>
                                    <p className="card-text">
                                        "Minha experiência no posto de saúde foi incrível! 
                                        Recebi um atendimento atencioso e eficiente."
                                    </p>
                                    <p className="card-text">
                                        "A equipe médica foi muito competente e me ajudou
                                        a resolver meu problema de saúde rapidamente."
                                    </p>
                                </div>
                            </div>

                            <div className="card mb-4">
                                <div className="card-body">
                                    <h3 className="card-title">Estudos de Caso:</h3>
                                    <p className="card-text">
                                        "Um caso de sucesso recente foi o tratamento eficaz de um paciente
                                        com condições graves, que recuperou completamente após o cuidado
                                        da nossa equipe médica."
                                    </p>
                                    <p className="card-text">
                                        "Outro caso notável foi a cirurgia bem-sucedida que transformou
                                        a vida de um paciente, proporcionando uma recuperação rápida
                                        e sem complicações."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Rodapé com redes sociais e endereço */}
            <main className="col-md-12 ms-sm-auto col-lg-10 px-md-4 d-flex flex-column">
                <footer className="bg-primary text-white py-4 mt-auto">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-6">
                                <h3>Redes Sociais:</h3>
                                <h4>@sistemadesaude</h4>
                                <ul className="list-unstyled d-flex justify-content-start">
                                    <li className="me-3">
                                        <a href="#">
                                            <i className="bi bi-facebook fs-3"></i>
                                        </a>
                                    </li>
                                    <li className="me-3">
                                        <a href="#">
                                            <i className="bi bi-twitter fs-3"></i>
                                        </a>
                                    </li>
                                    <li className="me-3">
                                        <a href="#">
                                            <i className="bi bi-instagram fs-3"></i>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-md-6">
                                <h3>Endereço:</h3>
                                <p>Rua Fictícia, 123 - Umuarama/PR</p>
                                <p>CEP: 12345-678 - Telefone: (44) 3456-7890</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </LayoutDashboard>
        </>
    );
}
