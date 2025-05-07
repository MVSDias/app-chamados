import { FiSettings, FiUpload } from "react-icons/fi";
import { Sidebar } from "../../components/Sidebar";
import { Title } from "../../components/Title";
import "./style.css";
import ProfileImg from "../../assets/avatar.png";
import { FormEvent, useContext, useState } from "react";
import { AuthContext } from "../../contexts/authContext";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../services/firebaseConnection";
import { toast } from "react-toastify";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export function Profile() {
  const { user, logout, saveUserDataOnLocalStorage, setUser } =
    useContext(AuthContext);

  const [avatarUrl, setAvatarUrl] = useState(user && user.avatarUrl); // se tiver user, user.avatarUrl será o valot inicial
  const [nome, setNome] = useState(user && user.name);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [email, setEmail] = useState(user && user.email);
  const [imageAvatar, setImageAvatar] = useState<File | null>(null);

  function handleAvatar(e: FormEvent) {
    const target = e.target as HTMLInputElement;

    if (target.files && target.files[0]) {
      // se existir o arquivo...
      const image = target.files[0]; // pego o arquivo na posição zero(primeiro) e salvo em image

      if (image.type === "image/png" || image.type === "image/jpeg") {
        setImageAvatar(image);
        setAvatarUrl(URL.createObjectURL(image)); // essa propriedade transforma um object em url
      } else {
        alert("Envie uma imagem do tipo png ou jpeg");
        setImageAvatar(null);
        return;
      }
    }
  }

  async function handleUploadFile() {
    // armazenando a imagem no firebase/storage
    if (imageAvatar) {
      // verifico se tem uma imagem
      const currentUid = user.uid; // pego uid do usuário logado
      const uploadRef = ref(
        // crioa referencia de onde armazenarei a imagem, passando o uid do usuário da imagem e o nome da imagem
        storage,
        `images/${currentUid}/${imageAvatar.name}`
      );
      const snapshot = await uploadBytes(uploadRef, imageAvatar); // aqui faço o upload da imagem, e como é await, o código só continua após terminar o upload
      const downloadURL = await getDownloadURL(snapshot.ref); // pego a url publica gerada da foto

      // aqui armazeno a url no arquivo do user logado
      const docRef = doc(db, "users", user.uid); // crio a referencia
      await updateDoc(docRef, {
        //aguardo atualizar o user, passando a nova url e o nome
        avatarUrl: downloadURL,
        name: nome,
      });

      const data = {
        // crio um objeto user com os dados q foram atualizados e mantendo os q não foram.
        ...user,
        name: nome,
        avatarUrl: downloadURL,
      };
      console.log("user após atualizar url", data);

      setUser(data); // atualizo o user
      saveUserDataOnLocalStorage(data); // salvo as alterações no localstorage
      toast.success("perfil atualizado");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (nome !== "" && avatarUrl === null) {
      // se tiver nome e não trocou foto...
      const docRef = doc(db, "users", user.uid); //crio a ref p atualizar no firebase passando a conexão(db), a collection ('users') e o uid do user logado
      await updateDoc(docRef, {
        // atualizo no firebase, mantendo o q tem dentro de user atualizando apenas o name. O updateDoc não retorna nada.
        ...user,
        name: nome,
      });
      const data = {
        // crio um objeto pra guardar as info do user atualizadas
        ...user, // mantenho o q tenho...
        name: nome, //atualizo apenas name com 'nome' que veio do input
      };

      console.log(data);
      setUser(data); // atualizo o user
      saveUserDataOnLocalStorage(data); // atualizo o conteudo do localstorage p persisitir na telatoast.success("Perfil atualizado!");
    } else {
      if (nome !== "" && avatarUrl !== null) {
        handleUploadFile();
      }
    }
  }

  return (
    <div>
      <Sidebar />
      <div className="content">
        <Title name="Minha conta">
          <FiSettings size={25} />
        </Title>

        <div className="container">

          <form onSubmit={handleSubmit} className="form-profile">
            <label className="label-avatar">
              <span>
                <FiUpload size={22} color="#fff" />
              </span>
              <input type="file" accept="image/*" onChange={handleAvatar} />
              {avatarUrl === null ? (
                <img src={ProfileImg} alt="imagem de perfil" />
              ) : (
                <img src={avatarUrl} alt="imagem de perfil" />
              )}
            </label>

            <label>Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <label>Email</label>
            <input type="text" value={email} disabled={true} />
            <button>Salvar</button>
          </form>
        </div>

        <div className="container">
          <button className="btn-logout" onClick={logout}>
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
