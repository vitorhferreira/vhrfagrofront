import axios from "axios";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
    const { cpf, senha } = await req.json();

    try {
        let usuario = await axios.get(
            `http://localhost:3001/usuarios?cpf=${cpf}`
        );

        console.log(usuario);

        if (usuario.data.length === 1) {
            if (usuario.data[0].senha === senha) {
                let objUsuario = usuario.data[0];
                delete objUsuario.senha;

                const token = jwt.sign(
                    objUsuario,
                    '123465', // secret
                    {
                        expiresIn: '1d' // 1 dia
                    }
                );

                return NextResponse.json({ token: token });
            }
        }

        return NextResponse.json({
            message: "Dados incorretos"
        }, { status: 401 });

    } catch (err) {
        console.log(err);
        return NextResponse.json(
            {
                message: 'Erro interno'
            },
            { status: 500 }
        );
    }
}
