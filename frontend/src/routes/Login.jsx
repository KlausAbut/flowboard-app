// Login page
// Fait par Cl@udiu — formulaire avec feedback visuel
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // charger l'email si l'utilisateur avait coché 'remember'
    try {
      const saved = localStorage.getItem("flowboard_remember_email");
      if (saved) {
        setEmail(saved);
        setRemember(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important pour cookie HttpOnly
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(
          body.error === "invalid"
            ? "Email ou mot de passe incorrect"
            : body.error || "Échec de la connexion"
        );
        return;
      }

      // gérer remember-me
      try {
        if (remember) localStorage.setItem("flowboard_remember_email", email);
        else localStorage.removeItem("flowboard_remember_email");
      } catch (e) {
        // ignore
      }

      // rediriger vers le board
      navigate("/board/1");
    } catch (err) {
      console.error(err);
      setError("Erreur réseau - Veuillez réessayer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Bienvenue sur FlowBoard
          </h2>
          <p className="text-gray-600 mt-1">
            Connectez-vous pour accéder à vos tableaux
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          aria-label="formulaire de connexion"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              autoFocus
              className="mt-1 w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="exemple@email.com"
              required
              aria-required="true"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mot de passe
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Votre mot de passe"
                required
                aria-required="true"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">Se souvenir de moi</span>
            </label>
            <Link
              to="/forgot"
              className="text-sm text-blue-600 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              loading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Vous n'avez pas de compte ?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Créer un compte
            </Link>
          </p>
        </div>

        {import.meta.env.DEV && (
          <div className="mt-6 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 font-medium mb-1">
              Comptes de test :
            </p>
            <ul className="text-sm text-gray-500 space-y-0.5">
              <li>Email: alice@example.com</li>
              <li>Email: bob@example.com</li>
              <li>Mot de passe: test123</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
