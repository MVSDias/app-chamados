import { ProviderProps } from "../../contexts/authContext";
import './style.css'

interface MyTitleProps extends ProviderProps {
    name: string;
}


export function Title({children, name}: MyTitleProps){ // recebo o icone e o nome aqui
    return ( // retorno esse componente com as info q foram passadas p
        <div className="title">
            {children}
            <span>{name}</span>
        </div>
    )
}