import { useGlobalDB } from "../../hooks/useTournament/useGlobalDB";
import { Login } from "../Login/Login";
import { useState } from "react";
import "./GlobalAdmin.css";
import { toast, ToastContainer } from "react-toastify";
import DataTable, { createTheme } from "react-data-table-component";

export const GlobalAdmin = () => {
  const {
    user,
    logoutAdmin,
    loading,
    tournamentdb,
    generateUniqueKey,
    deleteTournamentKey,
  } = useGlobalDB();
  const [keyWords, setKeyWords] = useState("");
  const [adminState, setAdminState] = useState("create");

  const toggleAdminState = () => {
    if (adminState === "create") setAdminState("review");
    else setAdminState("create");
  };

  const copyUrlToClipboard = (key) => {
    navigator.clipboard.writeText(
      "https://tournament-e57c8.web.app/" + key.currentTarget.id
    );
  };

  const goToUrl = (key) => {
    window.location.assign(
      "https://tournament-e57c8.web.app/" + key.currentTarget.id + "/admin"
    );
  };

  const deleteTKey = async (key) => {
    if (confirm("Segur que vols borrar el torneig?")) {
      await deleteTournamentKey(key.currentTarget.id);
    }
  };

  const generateKeyFunc = async () => {
    await generateUniqueKey(keyWords.replaceAll(" ", "-"));
    toast.success("Creat i copiat al portapapers", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      className: "w-100px",
    });
  };

  createTheme(
    "customDataTable",
    {
      text: {
        primary: "#f5e9d3",
        secondary: "#c0c0c0",
      },
      divider: {
        default: "#f5e9d3",
      },
      background: {
        default: "#3e2f20",
      },
    },
    "dark"
  );

  const columns = [
    {
      name: "Identificador",
      selector: (row) => row.id,
      sortable: true,
      maxWidth: "500px",
    },
    {
      name: "Data de creació",
      selector: (row) => row.creationDate,
      sortable: true,
    },
    {
      name: "Usuari creador",
      selector: (row) => row.creator,
      sortable: true,
    },
    {
      name: "Botons",
      width: "120px",
      cell: (row) => (
        <div className="table-buttons-wrap">
          <div
            className="table-button"
            id={row.id}
            onClick={(el) => {
              goToUrl(el);
            }}
          >
            <img src="/play.svg" alt="go" className="icon" />
          </div>
          <div
            className="table-button"
            id={row.id}
            onClick={(el) => {
              copyUrlToClipboard(el);
            }}
          >
            <img src="/copy.svg" alt="copy" className="icon" />
          </div>
          <div
            className="table-button"
            id={row.id}
            onClick={(el) => {
              deleteTKey(el);
            }}
          >
            <img src="/delete.svg" alt="delete" className="icon" />
          </div>
        </div>
      ),
    },
  ];

  const data = tournamentdb
    ? Object.entries(tournamentdb).map((el) => {
        return {
          id: el[0],
          creationDate: el[1].creationDate || "-",
          creator: el[1].creator || "-",
        };
      })
    : [];
  if (loading) return null;
  return (
    <>
      {!user ? (
        <Login />
      ) : (
        <div className="global-admin">
          {adminState === "create" && (
            <>
              <div className="logout-button" onClick={logoutAdmin}>
                Tancar sessió
              </div>
              <div className="global-admin-menu">
                <h1 className="global-admin-title">
                  Genera un nou ID de torneig
                </h1>
                <div className="global-admin-form">
                  <label className="global-admin-label">Paraules clau</label>
                  <input
                    type="text"
                    value={keyWords}
                    onChange={(e) => setKeyWords(e.target.value)}
                    required
                    className="global-admin-input"
                  />
                </div>
                <div className="create-seed-button" onClick={generateKeyFunc}>
                  Crear id nou
                </div>
              </div>
              <div className="review-seed-button" onClick={toggleAdminState}>
                Revisar taula ids
              </div>
            </>
          )}
          {adminState === "review" && (
            <>
              <div className="logout-button" onClick={logoutAdmin}>
                Tancar sessió
              </div>
              <div className="global-admin-menu review">
                <h1 className="global-admin-title">Revisio dels IDs creats</h1>
                <DataTable
                  columns={columns}
                  data={data}
                  pagination
                  theme="customDataTable"
                  dense
                />
              </div>

              <div className="review-seed-button" onClick={toggleAdminState}>
                Crear nou ID
              </div>
            </>
          )}
          <ToastContainer />
        </div>
      )}
    </>
  );
};
