import { Brackets } from "./Brackets";
import { MatchesTable } from "./MatchesTable";
import { useTournament } from "../../hooks/useTournament/useTournament";
import { useState } from "react";

export const BracketStructure = ({ setThemeStyle }) => {
  const { tournament, loading } = useTournament();
  const [userView, setUserView] = useState("Tournament");

  const toggleUserView = () => {
    if (userView === "Tournament") setUserView("League");
    else setUserView("Tournament");
  };

  if (loading) return null;

  return (
    <div className="bracket-structure">
      <div className="bracket-header">
        <div>
          {tournament?.imgTournament && (
            <img
              src={tournament.imgTournament}
              alt="Logo del torneig"
              className="bracket-tournament-logo"
            />
          )}
        </div>
        <div className="bracket-tournament-info">
          <h1 className="bracket-tournament-title">
            {tournament?.name ||
              "Torneig en fase de creació espera a que s'acabin de configurar els parametres"}
          </h1>
          {tournament && (
            <>
              <span className="bracket-tournament-subtitle">
                {tournament?.orgName && tournament.orgName}
              </span>
              <span className="bracket-tournament-subtitle">
                {tournament?.numPlayers + " jugadors"}
              </span>
            </>
          )}
        </div>
        <div>
          {tournament?.imgTournamentOrg && (
            <img
              src={tournament.imgTournamentOrg}
              alt="Logo organitzador"
              className="bracket-tournament-logo"
            />
          )}
        </div>
      </div>
      {(tournament?.type === "Tournament" ||
        (tournament?.type === "League+Tournament" &&
          tournament?.currentType === "Tournament" &&
          userView === "Tournament")) && (
        <Brackets setThemeStyle={setThemeStyle} />
      )}

      {(tournament?.type === "League" ||
        (tournament?.type === "League+Tournament" &&
          (tournament?.currentType === "League" || userView === "League"))) && (
        <MatchesTable
          setThemeStyle={setThemeStyle}
          oldMatches={
            tournament?.type === "League+Tournament" &&
            tournament?.currentType === "Tournament" &&
            userView === "League"
          }
        />
      )}
      {(tournament?.type === "Tournament" ||
        (tournament?.type === "League+Tournament" &&
          tournament?.currentType === "Tournament")) && (
        <>
          {tournament?.type === "League+Tournament" &&
            tournament?.currentType === "Tournament" && (
              <div className="back-button" onClick={toggleUserView}>
                {userView === "Tournament"
                  ? "Veure resultats de la lliga"
                  : "Veure resultats del torneig"}
              </div>
            )}
        </>
      )}
    </div>
  );
};
