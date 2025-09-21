import React, { useEffect, useState } from "react";

import { useTournament } from "../../hooks/useTournament/useTournament";
import "./EditPlayers.css";
import { toast } from "react-toastify";

export const EditPlayers = ({ setThemeStyle }) => {
  const { loading, tournament, setPlayersConfig } = useTournament();
  const [players, setPlayers] = useState({});

  useEffect(() => {
    if (!tournament) return () => {};
    setPlayers(tournament.Players);
    setThemeStyle(tournament.themeStyle);
  }, [tournament]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await setPlayersConfig(players);
    toast.success("Saved!", {
      position: "top-right",
      autoClose: 500,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      className: "w-100px",
    });
  };

  const handlePlayerChange = (key, value) => {
    setPlayers({ ...players, [key]: value });
  };

  if (loading || !tournament || !tournament.Players) return null;

  const shufflePlayerValues = () => {
    // Extraer los valores en un array
    const values = Object.values(players);

    // Función para mezclar un array usando el algoritmo de Fisher-Yates
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }

    // Crear un nuevo objeto con las keys originales y los valores mezclados
    const keys = Object.keys(players);
    const shuffledPlayers = {};
    keys.forEach((key, index) => {
      shuffledPlayers[key] = values[index];
    });

    setPlayers(shuffledPlayers);
  };

  return (
    <div className="edit-players-container">
      <h2 className="edit-players-title">Editar jugadors</h2>
      <form className="edit-players-form" onSubmit={handleSubmit}>
        {Object.entries(players).map(([key, value]) => (
          <div key={key} className="edit-players-container-player">
            <label className="edit-players-label">Jugador {key}</label>
            <input
              type="text"
              value={players[key]}
              onChange={(e) => handlePlayerChange(key, e.target.value)}
              placeholder={`Nom del jugador ${key}`}
              className="edit-players-input"
            />
          </div>
        ))}
        <button className="edit-players-button" type="submit">
          Guardar canvis
        </button>
        <button className="random-players-button" onClick={shufflePlayerValues}>
          Barreja jugadors
        </button>
      </form>
    </div>
  );
};
