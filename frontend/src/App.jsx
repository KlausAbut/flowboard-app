// App.jsx — route-based SPA
// Fait par Cl@udiu — version avec React Router + pages Login/Register/Board
import "./index.css";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./routes/Login";
import Register from "./routes/Register";
import Board from "./routes/Board";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <header className="p-4 border-b bg-white">
          <div className="container mx-auto flex items-center justify-between">
            <Link to="/" className="font-bold text-xl">
              FlowBoard
            </Link>
            <nav className="space-x-4">
              <Link to="/login" className="text-sm text-gray-600">
                Login
              </Link>
              <Link to="/register" className="text-sm text-gray-600">
                Register
              </Link>
            </nav>
          </div>
        </header>

        <main className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/board/1" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/board/:id" element={<Board />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
