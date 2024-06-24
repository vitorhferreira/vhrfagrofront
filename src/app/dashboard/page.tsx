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
                    <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 d-flex flex-column">
                        <div className="my-4">
                            {/* Imagem acima dos depoimentos */}
                            <img
                                src="https://lh5.googleusercontent.com/WRqiXPOZQzsbgwmdz0-Z5dZ-sEkrfAioa-8cloG8lJjLQjZ0jlp6E472ZGBeu10Adf9oynORdpJRIoN62CY4xZ-F2gb8h3xsJViSfuzwnzTzr8mt2qZAX7JELwHPngacSA=w1280" // URL da imagem desejada
                                alt="Imagem de destaque"
                                className="img-fluid mb-4"
                            />

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
        </LayoutDashboard>
        </>
    );
}
