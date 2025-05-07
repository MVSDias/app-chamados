import { Sidebar } from "../../components/Sidebar";
import "./style.css";
import { Title } from "../../components/Title";
import { FiEdit2, FiMessageCircle, FiPlus, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  DocumentData,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  startAfter,
} from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { Modal } from "../../components/Modal";



export interface ChamadosProps {
  created: Date;
  cliente: string;
  clientId: string;
  assunto: string;
  complemento: string;
  status: string ;
  userId: string;
  id: string;
}

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [isEmpty] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDocs, setLastDocs] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [chamados, setChamados] = useState<ChamadosProps[]>([]);
  const [detail, setDetail] = useState<ChamadosProps>();
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    const listRef = collection(db, "chamados");

    async function loadChamados() {
      
      const queryChamados = query(
        listRef,
        orderBy("created", "desc"),
        limit(5)
      );
      
      const querySnapshot = await getDocs(queryChamados);
      setChamados([]); // evita a duplicidade q o react.strictMode gera, duplicando os chamados na table.
      updateState(querySnapshot);
      setLoading(false);
    }

    loadChamados();
  }, []);

  function updateState(querySnapshot: QuerySnapshot<DocumentData>) {
    const isCollectionEmpty = querySnapshot.size === 0;
   
    if (!isCollectionEmpty) {
      const lista = querySnapshot.docs.map((doc) => ({
        created: doc.data().created.toDate(),
        cliente: doc.data().cliente,
        clientId: doc.data().clientId,
        assunto: doc.data().assunto,
        complemento: doc.data().complemento,
        status: doc.data().status,
        userId: doc.data().userId,
        id: doc.id
      }));

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]; // pego o doc na última posição (tamanho do array - 1, já q começa em 0)
      setChamados((chamados) => [...chamados, ...lista]); //mantenho o q já tenho e adiciono lista
      setLastDocs(lastDoc); //ultimo item renderizado
      
    }else {
      setLoading(false);
    }
    setLoadingMore(false);   
  }

  async function handleMore() { // paginando chamados
    setLoadingMore(true);
    
    const listRef = collection(db, "chamados");
    const queryChamados = query(listRef, orderBy("created", "desc"),
     startAfter(lastDocs), limit(5));

    const querySnapshot = await getDocs(queryChamados);

    updateState(querySnapshot);
  }

  function getStatusColor(status: string): string { // define a cor do chamado
    if (status === 'Aberto') return '#5fd204';
    else if (status === 'Progresso') return '#facc15'; // Exemplo
    else return '#999';
  }

  function toggleModal(item: ChamadosProps){
    setShowPostModal(!showPostModal); // inverto o valor q está dentro de showPostModal (se estiver false muda p true e vice-versa)
    setDetail(item)
  }

  if (loading) {
    return (
      <div>
        <Sidebar />
        <div className="content">
          <Title name="Chamados">
            <FiMessageCircle size={25} />
          </Title>

          <div className="container dashboard">
            <span>Buscando chamados...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar />
      <div className="content">
        <Title name="Chamados">
          <FiMessageCircle size={25} />
        </Title>

        <>
          {chamados.length === 0 ? (
            <div className="container dashboard">
              <span>Nenhum chamado cadastrado...</span>
              <Link to="/new" className="new">
                <FiPlus size={25} color="#fff" />
                Novo chamado
              </Link>
            </div>
          ) : (
            <>
              <Link to="/new" className="new">
                <FiPlus size={25} color="#fff" />
                Novo chamado
              </Link>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Cliente</th>
                    <th scope="col">Assunto</th>
                    <th scope="col">Status</th>
                    <th scope="col">Cadastrado em</th>
                    <th scope="col">#</th>
                  </tr>
                </thead>
                <tbody>
                  {chamados.map((item, index) => (
                    <tr key={index}>
                      <td data-label="Cliente">{item.cliente}</td>
                      <td data-label="Assunto">{item.assunto}</td>
                      <td data-label="Status">
                        <span
                          className="badge"
                          style={{ backgroundColor: getStatusColor(item.status) }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td data-label="Cadastrado">
                        {item.created.toLocaleDateString("pt-Br")}
                      </td>
                      <td data-label="#">
                        <button onClick={() => toggleModal(item)}
                          className="action"
                          style={{ backgroundColor: "#3583f6" }}
                        >
                          <FiSearch color="#fff" size={17} />
                        </button>
                        <Link to={`/new/${item.id}`}
                          className="action"
                          style={{ backgroundColor: "#f6a935" }}
                        >
                          <FiEdit2 color="#fff" size={17} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {loadingMore && <h3>Buscando mais chamados...</h3>}
              {!loadingMore && !isEmpty && (
                <button className="btn-more" onClick={handleMore}>
                  Buscar mais
                </button>
              )}
            </>
          )}
        </>
      </div>

      {showPostModal && (
        <Modal 
          conteudo={ detail } // passo o conteudo de item
          close={() => setShowPostModal(!showPostModal)} // chamo a função q troca o valor de showPostModal
      
        />)}

      
    </div>
  );
}
