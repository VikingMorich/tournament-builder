import { BracketStructure } from "../../components/Brackets/BracketStructure";
import "./Home.css";
import { useTournament } from "../../hooks/useTournament/useTournament";
import { Page404 } from "./Page404";

export const Home = () => {
  const { loading, tournament } = useTournament();
  if (loading) return null;
  return (
    <div
      className={
        "home " + (tournament?.themeStyle ? tournament?.themeStyle : "")
      }
    >
      {tournament ? <BracketStructure setThemeStyle={() => {}} /> : <Page404 />}
    </div>
  );
};
