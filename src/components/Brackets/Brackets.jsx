import { Bracket } from "react-brackets";

import { useTournament } from "../../hooks/useTournament/useTournament";
import { useEffect, useState } from "react";
import { CustomSeed } from "./CustomSeed";

export const Brackets = ({ setThemeStyle }) => {
  const { tournament, transformMatchesToRounds, loading } = useTournament();
  const [rounds, setRounds] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);

  const handleSwipeChange = (index) => {
    console.log(index);
    setTabIndex(index);
  };

  useEffect(() => {
    if (!tournament) return () => {};
    setRounds(
      transformMatchesToRounds(
        tournament.Matches || {},
        tournament.themeStyle,
        tournament.resultsAsPositions
      )
    );
    setThemeStyle(tournament.themeStyle);
  }, [tournament]);
  if (loading) return null;
  return (
    <Bracket
      rounds={rounds}
      roundTitleComponent={(title) => {
        return (
          <div
            style={{
              textAlign: "center",
              color: tournament.themeStyle === "retro" ? "#76b8cd" : "#d1b966",
            }}
          >
            {title}
          </div>
        );
      }}
      renderSeedComponent={CustomSeed}
      mobileBreakpoint={550}
      bracketClassName="bracket"
      swipeableProps={{
        enableMouseEvents: true,
        animateHeight: true,
        index: tabIndex,
        onChangeIndex: handleSwipeChange,
      }}
    />
  );
};
