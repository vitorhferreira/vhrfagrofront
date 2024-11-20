'use client';

import 'bootstrap/dist/css/bootstrap.min.css';


const HomePage = () => {
    return (
        <div 
            style={{
                backgroundImage: 'url("/inicio.png")', 
                backgroundSize: 'cover', 
                backgroundPosition: 'center', 
                height: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white',
                textAlign: 'center',
                padding: '0 20px'
            }}
        >
            <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: '40px', borderRadius: '8px' }}>
                <h1 className="display-4">Bem-vindo ao Sistema de Gestão de Pecuária</h1>
                <p className="lead">
                    Nossa plataforma facilita o gerenciamento completo de pecuária, incluindo o registro de lotes, monitoramento de vacinas, controle de consumo de ração e acompanhamento financeiro.
                    Oferecemos relatórios detalhados e recomendações alimentares via IA, tudo com foco na eficiência e rentabilidade do negócio.
                </p>
                <a href="/login" className="btn btn-primary btn-lg mt-4">Entrar</a>
                
                {/* Texto de Contato */}
                <p className="mt-4" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffc107' }}>
                    Tem interesse? Entre em contato pelo telefone <br/> (44) 98447-3802
                </p>
            </div>
        </div>
    );
};

export default HomePage;
