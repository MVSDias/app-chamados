import { Link } from "react-router-dom";
import Avatar from "../../assets/avatar.png";
import "./style.css";
import { FiHome, FiSettings, FiUser } from "react-icons/fi";
import { useContext } from "react";
import { AuthContext } from "../../contexts/authContext";

export function Sidebar() {
  const { user } = useContext(AuthContext);
  return (
    <div className="sidebar">
      <div>
        <img
          src={user.avatarUrl === null ? Avatar : user.avatarUrl}
          alt="foto de perfil"
        />
      </div>

      <Link to="/dashboard">
        <FiHome size={20} color="#fff" />
        Chamados
      </Link>

      <Link to="/clientes">
        <FiUser size={20} color="#fff" />
        Clientes
      </Link>

      <Link to="/profile">
        <FiSettings size={20} color="#fff" />
        Perfil
      </Link>
    </div>
  );
}
