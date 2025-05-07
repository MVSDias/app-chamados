import { FormEvent, useContext, useState } from "react";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import "./style.css";
import { AuthContext } from "../../contexts/authContext";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, loadingAuth } = useContext(AuthContext);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if(email !== '' && password !== ''){ // se email não estiver vazio e password também, monto o usuario e passo ele na função importada do context signIn
        // const userCredentials = {
        //     email,
        //     password,
        //   };
          
          signIn(email, password);
    }

    
  }

  return (
    <div className="container-center">
      <div className="login">
        <div className="login-area">
          <img src={logo} alt="logo do sistema chamos" />
        </div>
        <form onSubmit={handleSubmit} className="form">
          <h1>Entrar</h1>
          <input
            type="text"
            placeholder="digite o seu email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="digite a sua senha..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">
            {loadingAuth ? 'Carregando': 'Acessar'}
          </button>
        </form>

        <Link to="/register">Criar uma conta</Link>
      </div>
    </div>
  );
}
