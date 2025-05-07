import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { createContext, ReactNode, useEffect, useState } from "react";
import { auth } from "../services/firebaseConnection";
import {
  getUserDataOnFirestore,
  saveUserDataOnFirestore,
} from "../services/userServices";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export interface ProviderProps {
  children: ReactNode;
}

export interface UserProps {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}
interface SignProps {
  name: string;
  email: string;
  password: string;
}

interface AuthContextData {
  user: UserProps;
  signed: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: ({ name, email, password }: SignProps) => Promise<void>;
  logout: () => Promise<void>;
  saveUserDataOnLocalStorage: (userData: UserProps) => void;
  setUser: (user: UserProps) => void;
  loadingAuth: boolean;
  loading: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: ProviderProps) {
  function defaultUser(): UserProps {
    // essa função define o valor inicial do user, por causa do typescript preciso definir os types. Fazendo assim facilita e não preciso colocar essas informações todas as vezes q preciso resetar p valor inicial.
    return {
      uid: "",
      name: "",
      email: "",
      avatarUrl: null,
    };
  }
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loading, setLoading] = useState(true); //Se você inicia loading como false, o Private pode entender que já terminou de carregar, mesmo antes de o useEffect buscar os dados do localStorage. Isso gera aquele redirecionamento precoce pra tela de login — mesmo com os dados corretos sendo lidos logo em seguida.
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProps>(defaultUser());

  useEffect(() => {
    // vai buscar no localstorage as informações de user ao carregar a pagina. Se tiver dados lá ele coloca no setUser
    async function getUserDataOnLocalStorage() {
      // carrega as informações do localstorage na tela instantâneamente. Útil para evitar tela em branco.
      const userData = localStorage.getItem("@UserData");
      

      if (userData) {
        const data = JSON.parse(userData);

        setUser({
          name: data.name,
          email: data.email,
          uid: data.uid,
          avatarUrl: data.avatarUrl,
        });
      }
      setLoading(false);

      const unsub = onAuthStateChanged(auth, async (user) => {
        // vou ao firebase detectar se o user está logado, e fico observando qq mudança de estado(deslogar)
        if (user) {
          try {
            const data = await getUserDataOnFirestore(user.uid);
           
            const userData: UserProps = {
              uid: user.uid,
              name: data.name,
              email: user.email ?? "",
              avatarUrl: data.avatarUrl,
            };
            setUser(userData);
            saveUserDataOnLocalStorage(userData);
            
          } catch (err) {
            console.error("Erro ao buscar dados do Firestore", err);
            
          }
        } else {
          setUser(defaultUser());
          localStorage.removeItem("@userData");
          
        }
      });
      return () => unsub();
    }
    getUserDataOnLocalStorage()
  }, []);

  async function signUp({ name, email, password }: SignProps) {
    // cadastra o usuário no authentication
    setLoadingAuth(true); // mudo para true pq está carregando...

    try {
      const value = await createUserWithEmailAndPassword(auth, email, password); // registro o user com email e senha no auth
      const uid = value.user.uid; // esse uid foi gerado quando cadastrou o usuário no firestore.
      await saveUserDataOnFirestore(uid, name, email); // chamo a função p salvar o user no firestore(criar o documento)

      const userData: UserProps = {
        uid: value.user.uid,
        name,
        email,
        avatarUrl: null,
      };
      toast.success("Usuário cadastrado com sucesso");
      saveUserDataOnLocalStorage(userData);
      setUser(userData);
      navigate("/dashboard");
    } catch (err) {
      console.error("erro ao cadastrar", err);
      toast.error("Erro ao cadastrar usuário. Tente novamente!");
    } finally {
      setLoadingAuth(false);
    }
  }

  async function signIn(email: string, password: string) {
    // faz login do usuário na aplicação
    setLoadingAuth(true);

    try {
      const value = await signInWithEmailAndPassword(auth, email, password);
      const uid = value.user.uid;
      const data = await getUserDataOnFirestore(uid); //chamo a função passando o uid e recebo como retorno o user data

      toast.success("Bem vindo(a) de volta!");
      saveUserDataOnLocalStorage(data); // salvo os dados do usuário no localstorage
      setLoadingAuth(false);
      setUser(data); //atualizo o user
      navigate("/dashboard");
    } catch (err) {
      toast.error("Ops, algo deu errado! Confira seu email e senha");
      console.error(err);
      setLoadingAuth(false);
    }
  }

  function saveUserDataOnLocalStorage(userData: UserProps) {
    localStorage.setItem("@UserData", JSON.stringify(userData));
    
  }

  async function logout() {
    // desloga o usuário
    await signOut(auth);
    localStorage.removeItem("@UserData"); // limpo o localstorage
    setUser(defaultUser());
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user.uid, // as duas exclamações convertem p booleano - se baseia no user, se tiver user, signed vira true, se não, vira false.
        user,
        logout,
        signIn,
        signUp,
        saveUserDataOnLocalStorage,
        setUser,
        loadingAuth,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
