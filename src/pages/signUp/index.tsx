import { FormEvent, useContext, useState } from "react";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import "./style.css";
import { AuthContext } from "../../contexts/authContext";

export function SignUp() {
  const { signUp, loadingAuth } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (name && email && password) {
      await signUp({ name, email, password });
    }
    setName("");
    setEmail("");
    setPassword("");
  }

  return (
    <div className="container-center">
      <div className="login">
        <div className="login-area">
          <img src={logo} alt="logo do sistema chamos" />
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <h1>Cadastrar nova conta</h1>
          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="email@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="***********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">
            {loadingAuth ? "Carregando..." : "Cadastrar"}
          </button>
        </form>

        <Link to="/">Já possui uma conta? Faça login</Link>
      </div>
    </div>
  );
}
