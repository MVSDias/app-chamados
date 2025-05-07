import { FiX } from "react-icons/fi";
import "./style.css";
import { ChamadosProps } from "../../pages/Dashboard";

interface ModalProps {
  conteudo?: ChamadosProps;
  close: () => void;
}

export function Modal({ conteudo, close }: ModalProps) {
  function getStatusColor(status: string | undefined): string {
    // define a cor do chamado
    if (status === "Aberto") return "#5fd204";
    else if (status === "Progresso") return "#facc15"; // Exemplo
    else return "#999";
  }

  return (
    <div className="modal">
      <div className="container">
        <button className="close" onClick={close}>
          <FiX size={25} color="#fff" />
          Voltar
        </button>

        <main>
          <h2>Detalhes do chamado</h2>

          <div className="row">
            <span>
              Cliente: <i>{conteudo?.cliente}</i>
            </span>
          </div>

          <div className="row">
            <span>
              Assunto: <i>{conteudo?.assunto}</i>
            </span>
            <span>
              Cadastrado em:{" "}
              <i>{conteudo?.created.toLocaleDateString("pt-Br")}</i>
            </span>
          </div>

          <div className="row">
            <span>
              Status:{" "}
              <i
                style={{
                  color: "#fff",
                  borderRadius: "5px",
                  backgroundColor: getStatusColor(conteudo?.status),
                }}
              >
                {conteudo?.status}
              </i>
            </span>
          </div>

          {conteudo?.complemento !== "" && (
            <>
              <h3>Complemento</h3>
              <p>{conteudo?.complemento}</p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
