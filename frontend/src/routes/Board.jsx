// Board page — affiche le board et se connecte au socket.io
// Fait par Cl@udiu — utilise cookie HttpOnly; socket handshake envoie les cookies via withCredentials
import BoardView from "../components/BoardView";
import { useParams } from "react-router-dom";

// Wrapper pour utiliser BoardView avec le paramètre d'URL
export default function Board() {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <BoardView boardId={id} />
    </div>
  );
}
