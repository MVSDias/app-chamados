// O private é apenas uma função que verifica se posso acessar certas rotas, de acordo com as regras definidas. Ele será importado no arquivo de rotas e, como um componente, envolverá cada rota que estiver sob essas regras.

import { ReactNode, useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import { Navigate } from "react-router-dom";


interface PrivateProps {
    children: ReactNode
}

export function Private({children}: PrivateProps){ // crio a função Navegação privada e faço a verificação

    const { signed, loading } = useContext(AuthContext)
    

    if(loading){
        return <div></div>
    }

    if(!signed){ // verifico se user está logado(signed do authcontext)
        console.log("Usuário não autenticado. Redirecionando...");
       return (<Navigate to='/' />)
    }

    
    
    return children; // renderizo a rota.
}