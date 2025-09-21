import { Seed, SeedItem, SeedTeam } from "react-brackets";
import "./Brackets.css";

export const CustomSeed = ({ seed, breakpoint }) => {
  const homeTeam = seed.teams[0];
  const awayTeam = seed.teams[1];

  return (
    <Seed
      mobileBreakpoint={breakpoint}
      style={{ fontSize: 12 }}
      className="combat"
    >
      <SeedItem className="combat-wrapper">
        <div>
          <SeedTeam
            style={{
              backgroundColor: seed.resultsAsPositions
                ? homeTeam.score === 1 && seed.theme === "retro"
                  ? "#76b8cd"
                  : seed.theme === "taverna"
                  ? "#d1b966"
                  : ""
                : homeTeam.score > awayTeam.score && seed.theme === "retro"
                ? "#76b8cd"
                : seed.theme === "taverna"
                ? "#d1b966"
                : "",
              color: seed.resultsAsPositions
                ? homeTeam.score === 1
                  ? "black"
                  : "white"
                : homeTeam.score > awayTeam.score && "black",
            }}
          >
            <div>{homeTeam.name ? homeTeam.name : "----"}</div>
            <div>{homeTeam.score}</div>
          </SeedTeam>
          <SeedTeam
            style={{
              backgroundColor: seed.resultsAsPositions
                ? awayTeam.score === 1 && seed.theme === "retro"
                  ? "#76b8cd"
                  : seed.theme === "taverna"
                  ? "#d1b966"
                  : ""
                : homeTeam.score < awayTeam.score && seed.theme === "retro"
                ? "#76b8cd"
                : seed.theme === "taverna"
                ? "#d1b966"
                : "",
              color: seed.resultsAsPositions
                ? awayTeam.score === 1
                  ? "black"
                  : "white"
                : homeTeam.score < awayTeam.score && "black",
            }}
          >
            <div>{awayTeam.name ? awayTeam.name : "----"}</div>
            <div>{awayTeam.score}</div>
          </SeedTeam>
        </div>
      </SeedItem>
    </Seed>
  );
};
