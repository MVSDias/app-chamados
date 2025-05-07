import { FiPlusCircle } from "react-icons/fi";
import { Sidebar } from "../../components/Sidebar";
import { Title } from "../../components/Title";
import "./style.css";
import { ChangeEvent, FormEvent, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/authContext";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

interface CustomersProps {
  id: string | undefined;
  nomeFantasia: string | undefined;
}

export function New() {
  const { user } = useContext(AuthContext);

  const { id } = useParams(); // pego o id q vem na rota
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<CustomersProps[]>([]);
  const [customerSelected, setCustomerSelected] = useState(0);
  const [idCustomers, setIdCustomers] = useState(false);

  const [loadCustomer, setLoadCustomer] = useState(true);
  const [status, setStatus] = useState("Aberto");
  const [complemento, setComplemento] = useState("");
  const [assunto, setAsunto] = useState("Suporte");

  useEffect(() => {
    // crio um ciclo de vida q vai buscar os clientes no banco toda vez q a pagina recarregar
    console.log(id);
    const listRef = collection(db, "customers");

    async function loadCustomers() {
      try {
        const querySnapshot = await getDocs(listRef); // pego os docs no firebase/firestore

        if (querySnapshot.empty) {
          // se não tiver nada...
          console.log("Nenhuma empresa cadastrada");
          setLoadCustomer(false);
          setCustomers([{ id: "1", nomeFantasia: "FREELA" }]);
          return;
        }
        const lista = querySnapshot.docs.map((doc) => ({
          //faço um map no resultado da busca no banco e salvo na lista o objeto q tenha id e nome fantasia
          id: doc.id,
          nomeFantasia: doc.data().nomeFantasia,
        }));

        setLoadCustomer(false); // coloco q não está mais carregando
        setCustomers(lista); //atualizo customers com o conteúdo da lista

        if (id) {
          // se tiver id chamo a função que chama os dados dele(id)
          loadId(lista);
        }
      } catch (err) {
        console.error("erro ao buscar clientes", err);
        setLoadCustomer(false);
        setCustomers([{ id: "1", nomeFantasia: "FREELA" }]);
      }
    }
    loadCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // se tiver um id, que busque os itens referentes ao chamado desse id

  async function loadId(lista: CustomersProps[]) {
    if (!id) return; // garante que só entra se houver um id

    const docRef = doc(db, "chamados", id);

    try {
      const snapshot = await getDoc(docRef);
      //aqui preencho os campos q posso editar no chamado
      setAsunto(snapshot.data()?.assunto);
      setStatus(snapshot.data()?.status);
      setComplemento(snapshot.data()?.complemento);

      // aqui acesso o select de cliente do chamado

      const index = lista.findIndex(
        (item) => item.id === snapshot.data()?.clientId
      ); // faço uma busca na lista e comparo o id da lista com o clientId do snapshot, se forem iguais salvo em index
      setCustomerSelected(index);
      setIdCustomers(true); //pq deu tudo certo e estou na tela de editar chamado
    } catch (err) {
      console.error(err);
      setIdCustomers(false);
    }
  }

  function handleOptionChange(e: ChangeEvent<HTMLInputElement>) {
    setStatus(e.target.value);
  }

  function handleChangeSelect(e: ChangeEvent<HTMLSelectElement>) {
    setAsunto(e.target.value);
  }

  function handleChangeCustomer(e: ChangeEvent<HTMLSelectElement>) {
    setCustomerSelected(Number(e.target.value));
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();

    // EDITANDO CHAMADO EXISTENTE
    if (idCustomers) { // se for uma rota q tem idCustomers...atualizo
      //se for pra editar cai aqui.
      if (!id) { // se não tiver id, interrompo.
        return;
      }
      const editRef = doc(db, "chamados", id);
      try {
        await updateDoc(editRef, { //só não atualizo o created.
          cliente: customers[customerSelected].nomeFantasia,
          clientId: customers[customerSelected].id,
          assunto,
          complemento,
          status,
          userId: user.uid,
        });
        toast.success('Atualizado com sucesso')
        setCustomerSelected(0); //volta pra zero pq já atualizou
        setComplemento('') // limpo a textarea
        navigate('/dashboard') // navego p pagina de dashboard(chamados)
      } catch (err) {
        console.error(err);
      }
      return;
    }

    //ADICIONANDO UM NOVO CHAMADO - não tem idCustomers
    try {
      await addDoc(collection(db, "chamados"), {
        created: serverTimestamp(),
        cliente: customers[customerSelected].nomeFantasia,
        clientId: customers[customerSelected].id,
        assunto,
        complemento,
        status,
        userId: user.uid,
      });
      toast.success("Chamado registrado");
      setComplemento("");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao registar chamado");
    }
  }

  return (
    <div>
      <Sidebar />

      <div className="content">
        <Title name={id ? 'Editando chamado' : 'Novo chamado'}>
          <FiPlusCircle size={25} />
        </Title>

        <div className="container">
          <form className="form-profile" onSubmit={handleRegister}>
            <label>Clientes</label>
            {loadCustomer ? (
              <input type="text" disabled={true} value="carregando..." />
            ) : (
              <select value={customerSelected} onChange={handleChangeCustomer}>
                {customers.map((item, index) => {
                  return (
                    <option key={index} value={index}>
                      {item.nomeFantasia}
                    </option>
                  );
                })}
              </select>
            )}

            <label>Assunto</label>
            <select value={assunto} onChange={handleChangeSelect}>
              <option value="Suporte">Suporte</option>
              <option value="Visita técnica">Visita técnica</option>
              <option value="Financeiro">Financeiro</option>
            </select>

            <label>Status</label>
            <div className="status">
              <input
                type="radio"
                name="radio"
                value="Aberto"
                onChange={handleOptionChange}
                checked={status === "Aberto"}
              />
              <span>Em aberto</span>

              <input
                type="radio"
                name="radio"
                value="Progresso"
                onChange={handleOptionChange}
                checked={status === "Progresso"}
              />
              <span>Em Progresso</span>

              <input
                type="radio"
                name="radio"
                value="Atendido"
                onChange={handleOptionChange}
                checked={status === "Atendido"}
              />
              <span>Atendido</span>
            </div>

            <label>Complemento</label>
            <textarea
              placeholder="Descreva seu problema (opcional)."
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
            />
            <button type="submit">Registrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
