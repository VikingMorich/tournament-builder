import { useGlobalDB } from "../../hooks/useTournament/useGlobalDB";
import { Login } from "../Login/Login";
import { GlobalAdmin } from "./GlobalAdmin";
import "./GlobalAdmin.css";

export const GlobalAdminView = () => {
  const { user } = useGlobalDB();

  return <>{!user ? <Login /> : <GlobalAdmin />}</>;
};
