import { useTournament } from "../../hooks/useTournament/useTournament";
import "./MatchesTable.css";

import { useEffect, useState } from "react";

export const MatchesTable = ({ setThemeStyle, oldMatches }) => {
  const { tournament } = useTournament();
  const [sortedLeagueScore, setSortedLeagueScore] = useState([]);
  const [specialRoundPlayer, setSpecialRoundPlayer] = useState({});
  const [matches, setMatches] = useState({});

  useEffect(() => {
    if (!tournament || !tournament.leagueScore) return () => {};
    setSortedLeagueScore(
      tournament.type === "League" || tournament.type === "League+Tournament"
        ? Object.entries(tournament.leagueScore).sort(
            ([, v1], [, v2]) => v2 - v1
          )
        : []
    );
    setThemeStyle(tournament.themeStyle);
    setMatches(
      !oldMatches
        ? tournament.Matches?.Round1
        : tournament.leagueMatches?.Round1 || []
    );
  }, [tournament]);

  return (
    <div className="matches-table">
      <h2 className="matches-title">Enfrontaments</h2>
      <div className="round-wrapper">
        {tournament &&
          matches &&
          Object.entries(matches).map(([matchId, value]) => (
            <div key={matchId} className="match-wrapper">
              {/* hide if playerId === specialRoundPlayer */}
              {Object.entries(value).map(([playerId, val]) => {
                if (playerId === "specialRoundPlayer") return null;
                if (Object.keys(value).includes("specialRoundPlayer")) {
                  setSpecialRoundPlayer({
                    matchId: matchId,
                    specialRoundPlayer: value.specialRoundPlayer,
                  });
                  delete value.specialRoundPlayer;
                }
                return (
                  <div
                    key={matchId + playerId}
                    className={`match-player ${
                      parseInt(val) !== 0 &&
                      (tournament.resultsAsPositions
                        ? val !== 0 && parseInt(val) === 1
                          ? "max"
                          : ""
                        : parseInt(val) !== 0 &&
                          parseInt(val) ===
                            Math.max(...Object.values(value).map(Number))
                        ? "max"
                        : "")
                    }`}
                  >
                    <span>
                      {(matchId === specialRoundPlayer.matchId &&
                      playerId === specialRoundPlayer.specialRoundPlayer
                        ? "⦿ "
                        : "") +
                        (tournament.Players[playerId]
                          ? tournament.Players[playerId]
                          : "---")}
                    </span>
                    <span>{val}</span>
                  </div>
                );
              })}
            </div>
          ))}
      </div>
      <br />
      <br />
      <h4 className="matches-title">Puntuacions</h4>
      <div className="scores-table">
        {tournament &&
          sortedLeagueScore.map(([playerId, score], index) => (
            <div
              key={playerId}
              className={"tr " + (score === 0 ? "no-score" : "")}
            >
              <div className="td min-td">{index + 1}</div>
              <div className="td">
                {tournament.Players[playerId]
                  ? tournament.Players[playerId]
                  : "-----"}
              </div>
              <div className="td min-td">{score}</div>
            </div>
          ))}
      </div>
    </div>
  );
};
