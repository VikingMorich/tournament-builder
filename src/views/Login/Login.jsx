import "./Login.css";
import { useGlobalDB } from "../../hooks/useTournament/useGlobalDB";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export const Login = () => {
  const { loginAdmin } = useGlobalDB();

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  const loginFunction = async () => {
    try {
      await loginAdmin(user, password);
    } catch (error) {
      toast.error("Email o contrassenya incorrectes", {
        autoClose: 1000,
        theme: "colored",
      });
    }
  };

  return (
    <div className="login-view">
      <div className="login-wrap">
        <div className="login-op">
          <span>Email: </span>
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            required
          />
        </div>
        <div className="login-op">
          <span>Contrassenya: </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="login-button" onClick={loginFunction}>
          Entrar
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
