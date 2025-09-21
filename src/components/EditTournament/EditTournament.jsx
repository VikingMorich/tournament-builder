import React, { useEffect, useState } from "react";

import { useTournament } from "../../hooks/useTournament/useTournament";
import "./EditTournament.css";
import { toast } from "react-toastify";
import { useParams } from "react-router";

export const EditTournament = ({ themeStyle, setThemeStyle }) => {
  const { loading, tournament, setTournamentConfig, deleteTournament } =
    useTournament();
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [tournamentOrgImg, setTournamentOrgImg] = useState("");
  const [tournamentImg, setTournamentImg] = useState("");
  const [numPlayers, setNumPlayers] = useState(4);
  const [numPlayersForTournament, setNumPlayersForTournament] = useState(4);
  const [type, setType] = useState("Tournament");
  const [playersForMatch, setPlayersForMatch] = useState(2);
  const [scoreForPos, setScoreForPos] = useState([]);
  const [matchesForPlayer, setMatchesForPlayer] = useState(1);
  const [resultsAsPositions, setResultsAsPositions] = useState(false);
  const { seed } = useParams();

  const inputs = document.querySelectorAll(".auto-select");

  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      setTimeout(() => input.select(), 10);
    });
    input.addEventListener("touchend", () => {
      setTimeout(() => input.select(), 10);
    });
  });

  useEffect(() => {
    if (!tournament) return () => {};
    setName(tournament.name || "");
    setNumPlayers(tournament.numPlayers);
    setType(tournament.type || "Tournament");
    setOrgName(tournament.orgName || "");
    setTournamentImg(tournament.imgTournament || "");
    setTournamentOrgImg(tournament.imgTournamentOrg || "");
    setPlayersForMatch(tournament.playersForMatch || 2);
    setScoreForPos(tournament.scoreForPos || []);
    setMatchesForPlayer(tournament.matchesForPlayer || 1);
    setResultsAsPositions(tournament.resultsAsPositions || false);
    setThemeStyle(tournament?.themeStyle);
    setNumPlayersForTournament(tournament.numPlayersForTournament || 4);
  }, [tournament]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tournamentData = {
      name,
      numPlayers: numPlayers || 4,
      type,
      imgTournament: tournamentImg || "",
      imgTournamentOrg: tournamentOrgImg || "",
      orgName: orgName || "",
      playersForMatch:
        ((type === "League" || type === "League+Tournament") &&
          playersForMatch) ||
        null,
      matchesForPlayer:
        ((type === "League" || type === "League+Tournament") &&
          matchesForPlayer) ||
        null,
      scoreForPos:
        ((type === "League" || type === "League+Tournament") &&
          scoreForPos.slice(0, playersForMatch)) ||
        null,
      resultsAsPositions: resultsAsPositions || false,
      themeStyle: themeStyle || null,
      numPlayersForTournament:
        (type === "League+Tournament" && numPlayersForTournament) || null,
    };

    await setTournamentConfig(tournamentData);
    if (
      (type === "League" || type === "League+Tournament") &&
      scoreForPos.length < playersForMatch
    ) {
      toast.error("Has d'introduir la puntuació per a totes les posicions");
      return;
    }
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

  const handleDelete = async (e) => {
    e.preventDefault();
    if (confirm("Segur que vols borrar el torneig?")) {
      await deleteTournament();
    }
  };

  const getBase64SizeInKB = (base64String) => {
    let padding = 0;
    if (base64String.endsWith("==")) padding = 2;
    else if (base64String.endsWith("=")) padding = 1;

    const base64Length = base64String.length;
    const sizeInBytes = (base64Length * 3) / 4 - padding;

    return sizeInBytes / 1024; // KB
  };

  const MAX_SIZE_KB = 120; // un poco menos que el límite real por seguridad

  const resizeImage = (file, maxWidth = 400) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const scale = maxWidth / img.width;
          const width = img.width * scale;
          const height = img.height * scale;

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const resizedBase64 = canvas.toDataURL("image/jpeg", 0.7); // calidad 70%
          resolve(resizedBase64);
        };
        img.onerror = reject;
        img.src = event.target.result;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const saveBase64Image = async (base64, imageId, type) => {
    if (type === "organizer") {
      setTournamentOrgImg(base64);
    } else {
      setTournamentImg(base64);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const resizedBase64 = await resizeImage(file);

      const sizeKB = getBase64SizeInKB(resizedBase64);
      if (sizeKB > MAX_SIZE_KB) {
        alert(
          `La imagen es demasiado grande (${Math.round(
            sizeKB
          )} KB). Reduce la resolución.`
        );
        return;
      }

      await saveBase64Image(resizedBase64, "compressed-image-tournament", type);
      console.log("Imagen comprimida y guardada correctamente");
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
    }
  };

  if (loading) return null;

  const goToGlobalAdmin = () => {
    window.location.assign("https://tournament-e57c8.web.app/admin");
  };

  return (
    <>
      <div className="button-global-admin" onClick={goToGlobalAdmin}>
        <img src="/terminal.svg" alt="terminal" className="icon" />
      </div>
      <div className="edit-tournament-container">
        <div className="edit-tounament-seed">
          <span>{seed}</span>
        </div>
        <h2 className="edit-tournament-title">Editar Configuració</h2>
        <form onSubmit={handleSubmit} className="edit-tournament-form">
          <div>
            <label className="edit-tournament-label">
              Tipus d'enfrentament
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setNumPlayers(e.target.value === "Tournament" ? 4 : "");
              }}
              className="edit-tournament-select"
            >
              <option value={"Tournament"}>Torneig</option>
              <option value={"League"}>Lliga</option>
              <option value={"League+Tournament"}>Lliga + Torneig</option>
            </select>
          </div>
          <div>
            <label className="edit-tournament-label">Nom del torneig</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="edit-tournament-input"
            />
          </div>
          <div>
            <label className="edit-tournament-label">Número de jugadors</label>
            {type === "Tournament" && (
              <select
                value={numPlayers}
                onChange={(e) => setNumPlayers(Number(e.target.value))}
                className="edit-tournament-select"
              >
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={16}>16</option>
              </select>
            )}
            {(type === "League" || type === "League+Tournament") && (
              <input
                type="number"
                value={numPlayers}
                onChange={(e) => setNumPlayers(Number(e.target.value))}
                required
                className="edit-tournament-input auto-select"
              />
            )}
          </div>
          <div>
            <label className="edit-tournament-label">
              Imatge del torneig (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleFileUpload(e, "tournament");
              }}
            />
          </div>
          {tournamentImg && (
            <div className="img-preview-edit">
              <img
                src={tournamentImg}
                alt="Preview"
                className="image-preview"
              />
              <button
                onClick={() => {
                  setTournamentImg("");
                }}
                className="delete-img-button"
              >
                <span>Borrar</span>
              </button>
            </div>
          )}
          <div>
            <label className="edit-tournament-label">
              Nom de l'organitzador / subtítol (opcional)
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="edit-tournament-input"
            />
          </div>
          <div>
            <label className="edit-tournament-label">
              Imatge del organitzador (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleFileUpload(e, "organizer");
              }}
            />
          </div>
          {tournamentOrgImg && (
            <div className="img-preview-edit">
              <img
                src={tournamentOrgImg}
                alt="Preview"
                className="image-preview"
              />
              <button
                onClick={() => {
                  setTournamentOrgImg("");
                }}
                className="delete-img-button"
              >
                <span>Borrar</span>
              </button>
            </div>
          )}
          <div>
            <label className="edit-tournament-label">Tema (Estíl)</label>
            <select
              value={themeStyle}
              onChange={(e) => {
                setThemeStyle(e.target.value);
              }}
              className="edit-tournament-select"
            >
              <option value={"taverna"}>Taverna</option>
              <option value={"retro"}>Retro</option>
            </select>
          </div>
          {(type === "League" || type === "League+Tournament") && (
            <div>
              <label className="edit-tournament-label">
                Jugadors per partit
              </label>
              <input
                type="number"
                value={playersForMatch}
                onChange={(e) => setPlayersForMatch(Number(e.target.value))}
                className="edit-tournament-input auto-select"
              />
            </div>
          )}
          {(type === "League" || type === "League+Tournament") && (
            <div className="config-league-scores">
              <h5>Configurar puntuacions per jugador</h5>
              {Array.from({ length: playersForMatch }, (_, index) => (
                <div key={index}>
                  <label className="edit-tournament-label">
                    Punts per la posició {index + 1}
                  </label>
                  <input
                    type="number"
                    value={
                      scoreForPos[index] || scoreForPos[index] !== null
                        ? scoreForPos[index]
                        : ""
                    }
                    onChange={(e) => {
                      const updated = [...scoreForPos];
                      updated[index] = Number(e.target.value);
                      setScoreForPos(updated);
                    }}
                    className="edit-tournament-input auto-select"
                  />
                </div>
              ))}
            </div>
          )}

          {(type === "League" || type === "League+Tournament") && (
            <>
              <div>
                <label className="edit-tournament-label">
                  Partits per jugador
                </label>
                <input
                  type="number"
                  value={matchesForPlayer}
                  onChange={(e) => setMatchesForPlayer(Number(e.target.value))}
                  className="edit-tournament-input auto-select"
                />
              </div>
            </>
          )}

          <div
            className="edit-tournament-checkbox"
            onClick={() => {
              setResultsAsPositions(!resultsAsPositions);
            }}
          >
            <input
              type="checkbox"
              checked={resultsAsPositions}
              onChange={(e) => {
                e.stopPropagation();
              }}
            />
            <label className="edit-tournament-label">
              Resultats com a posicions de jugador
            </label>
          </div>

          {type === "League+Tournament" && (
            <div>
              <label className="edit-tournament-label">
                Número de jugadors del torneig (millors de la lliga)
              </label>
              <select
                value={numPlayersForTournament}
                onChange={(e) =>
                  setNumPlayersForTournament(Number(e.target.value))
                }
                className="edit-tournament-select"
              >
                <option value={4}>4</option>
                {numPlayers >= 8 && <option value={8}>8</option>}
                {numPlayers >= 16 && <option value={16}>16</option>}
              </select>
            </div>
          )}

          <button type="submit" className="edit-tournament-button">
            Actualizar torneig
          </button>
          <button className="delete-tournament-button" onClick={handleDelete}>
            Borrar torneig
          </button>
        </form>
      </div>
    </>
  );
};
