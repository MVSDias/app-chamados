import { FiUser } from "react-icons/fi";
import { Sidebar } from "../../components/Sidebar";
import { Title } from "../../components/Title";
import { FormEvent, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";
import { toast } from "react-toastify";

export function Customers() {

  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [endereco, setEndereco] = useState('');

  async function handleRegister(e: FormEvent){ // cadastrar empresa
    e.preventDefault();

    if(nomeFantasia !== '' && cnpj !== '' && endereco !== ''){

      try {
        await addDoc(collection(db, 'customers'), {
          nomeFantasia: nomeFantasia,
          cnpj: cnpj,
          endereco: endereco
        }) 
        setNomeFantasia('');
        setCnpj('');
        setEndereco('')
        toast.success('Cadastrado com sucesso')

      } catch(err){
        console.error('Erro ao cadastrar', err)
      }      
    }       
  }


  return (
    <div>
      <Sidebar />
      <div className="content">
        <Title name="Clientes">
          <FiUser size={35} />
        </Title>

        <div className="conatiner">
          <form className="form-profile" onSubmit={handleRegister}>
          <label>Nome Fantasia</label>
            <input
              type="text"
              placeholder="Digite o nome da empresa"
              value={nomeFantasia}
              onChange={(e) => setNomeFantasia(e.target.value)}
            />
          <label>CNPJ</label>
            <input
              type="text"
              placeholder="Digite o CNPJ da empresa"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
            />
          <label>Endereço</label>
            <input
              type="text"
              placeholder="Digite o endereço da empresa"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />

            <button type="submit">Salvar</button>
          </form>

        </div>




      </div>
    </div>
  );
}
