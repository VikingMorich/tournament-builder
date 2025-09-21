import { useState } from "react";

import { useTournament } from "../../hooks/useTournament/useTournament";
import { useGlobalDB } from "../../hooks/useTournament/useGlobalDB";
import { EditTournament } from "../../components/EditTournament/EditTournament";
import { EditPlayers } from "../../components/EditPlayers/EditPlayers";
import "./Admin.css";
import { EditResults } from "../../components/EditResults/EditResults";
import { BracketStructure } from "../../components/Brackets/BracketStructure";
import { ToastContainer } from "react-toastify";
import { Login } from "../Login/Login";
import { Page404 } from "../Home/Page404";

export const Admin = () => {
  const { loading, tournament } = useTournament();
  const { user, logoutAdmin } = useGlobalDB();
  const [activeSection, setActiveSection] = useState("edit-tournament");
  const [themeStyle, setThemeStyle] = useState("taverna");

  const setCurrentSection = (section) => {
    setActiveSection(section);
  };

  if (loading) return null;
  return (
    <>
      {!user ? (
        <Login />
      ) : tournament ? (
        <div className={"admin-panel " + (themeStyle ? themeStyle : "")}>
          <nav className="admin-nav">
            <button
              className={`admin-nav-button ${
                activeSection === "edit-tournament" ? "active" : ""
              }`}
              onClick={() => setCurrentSection("edit-tournament")}
            >
              Editar configuració
            </button>
            <button
              className={`admin-nav-button ${
                activeSection === "edit-players" ? "active" : ""
              }`}
              onClick={() => setCurrentSection("edit-players")}
            >
              Editar jugadors
            </button>
            <button
              className={`admin-nav-button ${
                activeSection === "edit-results" ? "active" : ""
              }`}
              onClick={() => setCurrentSection("edit-results")}
            >
              Editar resultats
            </button>
            <button
              className={`admin-nav-button ${
                activeSection === "user-view" ? "active" : ""
              }`}
              onClick={() => setCurrentSection("user-view")}
            >
              Vista usuari
            </button>
          </nav>
          <div className="admin-panel-content">
            {activeSection === "edit-tournament" && (
              <EditTournament
                themeStyle={themeStyle}
                setThemeStyle={setThemeStyle}
              />
            )}
            {activeSection === "edit-players" && (
              <EditPlayers setThemeStyle={setThemeStyle} />
            )}
            {activeSection === "edit-results" && (
              <EditResults setThemeStyle={setThemeStyle} />
            )}
            {activeSection === "user-view" && (
              <BracketStructure setThemeStyle={setThemeStyle} />
            )}
          </div>

          <div className="logout-button" onClick={logoutAdmin}>
            Tancar sessió
          </div>
          <ToastContainer />
        </div>
      ) : (
        <Page404 />
      )}
    </>
  );
};
