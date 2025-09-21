import React, { useEffect, useState } from "react";
import { useTournament } from "../../hooks/useTournament/useTournament";
import { toast } from "react-toastify";

import "./EditResults.css";

export const EditResults = ({ setThemeStyle }) => {
  const { tournament, loading, setMatchesScore, startTournamentAfterLeague } =
    useTournament();
  const [matches, setMatches] = useState({});
  const [recalculateFrom, setRecalculateFrom] = useState(1);
  const [matchesCompleted, setMatchesCompleted] = useState(false);

  const inputs = document.querySelectorAll(".auto-select"); // Cambia 'auto-select' por tu clase

  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      setTimeout(() => input.select(), 10);
    });
    input.addEventListener("touchend", () => {
      setTimeout(() => input.select(), 10);
    });
  });

  const getLastRoundNumber = (matches) => {
    const roundKeys = matches
      ? Object.keys(matches)
          .filter((key) => key.startsWith("Round"))
          .map((key) => parseInt(key.replace("Round", ""), 10))
          .filter((num) => !isNaN(num))
      : [];

    return roundKeys.length ? Math.max(...roundKeys) : 0;
  };

  useEffect(() => {
    if (!tournament) return () => {};
    setMatches(tournament.Matches);
    setRecalculateFrom(getLastRoundNumber(tournament.Matches) || 1);
    setThemeStyle(tournament.themeStyle);

    if (tournament.type === "League+Tournament") {
      const hasAllZeroObject = tournament.Matches?.Round1?.some((obj) =>
        Object.values(obj).every((value) => parseInt(value) === 0)
      );
      if (!hasAllZeroObject) {
        setMatchesCompleted(true);
      } else {
        setMatchesCompleted(false);
      }
    }
  }, [tournament]);

  // const deleteResults = async () => {
  //   await deleteMatches();
  //   await deleteLeagueScore();
  // };

  const saveScore = async (e) => {
    e.preventDefault();

    const generateNextRound = (currentRound, resultsAsPositions) => {
      console.log(currentRound);
      const formattedRound = Array.isArray(
        currentRound[`Round${recalculateFrom}`]
      )
        ? currentRound[`Round${recalculateFrom}`]
        : Object.values(currentRound[`Round${recalculateFrom}`]);

      const nextRoundMatches = formattedRound.reduce(
        (acc, match, index, arr) => {
          if (index % 2 === 0 && arr[index + 1]) {
            const winnerA = Object.entries(match).reduce((a, b) => {
              if (resultsAsPositions) {
                return b[1] < a[1] ? b : a;
              } else return b[1] > a[1] ? b : a;
            });
            const winnerB = Object.entries(arr[index + 1]).reduce((a, b) => {
              if (resultsAsPositions) {
                return b[1] < a[1] ? b : a;
              } else return b[1] > a[1] ? b : a;
            });
            if (winnerA[1] != 0 && winnerB[1] != 0) {
              acc.push({ [winnerA[0]]: "0", [winnerB[0]]: "0" });
            } else if (winnerA[1] != 0) {
              acc.push({ [winnerA[0]]: "0", ["-"]: "0" });
            } else if (winnerB[1] != 0) {
              acc.push({ ["-"]: "0", [winnerB[0]]: "0" });
            } else {
              acc.push({ ["-"]: "0", ["--"]: "0" });
            }
          }
          return acc;
        },
        []
      );
      return nextRoundMatches;
    };

    // Esperar a que el estado se actualice completamente antes de usarlo
    await new Promise((resolve) => {
      setMatches((prevMatches) => {
        // Crear una copia del estado anterior sin las rondas posteriores
        const updatedMatches = Object.keys(prevMatches).reduce((acc, key) => {
          const roundNumber = parseInt(key.replace("Round", ""), 10);

          // Conservar solo las rondas hasta recalculateFrom + 1
          if (roundNumber <= recalculateFrom + 1) {
            acc[key] = prevMatches[key];
          }

          return acc;
        }, {});

        // Agregar la nueva ronda recalculada
        if (
          tournament.type === "Tournament" ||
          (tournament.type === "League+Tournament" &&
            tournament.currentType === "Tournament")
        ) {
          const nextRound = generateNextRound(
            matches,
            tournament.resultsAsPositions
          );
          updatedMatches[`Round${recalculateFrom + 1}`] = nextRound;
        }

        resolve(updatedMatches);
        return updatedMatches;
      });
    }).then(async (updatedMatches) => {
      await setMatchesScore(
        updatedMatches,
        tournament.type,
        tournament.Players,
        tournament.scoreForPos,
        tournament.resultsAsPositions,
        tournament.currentType
      ); // Usa la versión ya actualizada de `matches`
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
    });
  };

  const handleScoreChange = (round, matchId, playerId, value) => {
    const roundNum = parseInt(round.replace("Round", ""), 10);
    if (roundNum < recalculateFrom) setRecalculateFrom(roundNum);
    setMatches((prev) => ({
      ...prev,
      [round]: {
        ...prev[round],
        [matchId]: {
          ...prev[round][matchId],
          [playerId]: value,
        },
      },
    }));
  };

  if (loading) return null;
  return (
    <div className="edit-results-container">
      <h2 className="edit-results-title">Editar Resultats</h2>
      {matches &&
        Object.entries(matches).map(([roundId, roundVal]) => (
          <div className="edit-results-form" key={roundId}>
            {(tournament.type === "Tournament" ||
              (tournament.type === "League+Tournament" &&
                tournament.currentType === "Tournament")) && (
              <h4 className="edit-results-round-title">{roundId}</h4>
            )}
            {Object.entries(roundVal).map(([matchId, value]) => (
              <div className="match-wrap" key={matchId}>
                <span className="match-title">
                  Partit {parseInt(matchId) + 1}
                </span>
                <div key={matchId} className="edit-results-match-wrapper">
                  {Object.entries(value).map(([playerId, val]) => {
                    if (playerId === "specialRoundPlayer") return null;
                    return (
                      <div
                        key={matchId + playerId}
                        className="edit-results-user-wrapper"
                      >
                        <span className="edit-results-label">
                          {tournament.Players[playerId]
                            ? tournament.Players[playerId]
                            : "??"}{" "}
                          -{" "}
                        </span>
                        {!tournament.resultsAsPositions && (
                          <input
                            type="text"
                            value={val || ""}
                            className="edit-results-input auto-select"
                            onChange={(e) =>
                              handleScoreChange(
                                roundId,
                                matchId,
                                playerId,
                                e.target.value
                              )
                            }
                            placeholder={`Puntuacion`}
                          />
                        )}
                        {tournament.resultsAsPositions && (
                          <select
                            value={val}
                            onChange={(e) =>
                              handleScoreChange(
                                roundId,
                                matchId,
                                playerId,
                                e.target.value
                              )
                            }
                            className="edit-results-select"
                          >
                            <option value={0}>Selecciona una opcció</option>
                            {tournament.scoreForPos?.map((score, index) => (
                              <option key={index + 1} value={index + 1}>
                                {index + 1}
                              </option>
                            )) || (
                              <>
                                <option key={1} value={1}>
                                  1
                                </option>
                                <option key={2} value={2}>
                                  2
                                </option>
                              </>
                            )}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      <button className="edit-results-button" onClick={saveScore}>
        Guarda els canvis
      </button>
      {tournament.type === "League+Tournament" &&
        tournament.currentType === "League" &&
        matchesCompleted && (
          <button
            className="start-tournament-button"
            onClick={() => startTournamentAfterLeague(tournament)}
          >
            Començar Torneig
          </button>
        )}
    </div>
  );
};
