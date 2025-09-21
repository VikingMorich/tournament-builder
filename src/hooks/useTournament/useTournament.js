import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, off , update, remove} from "firebase/database";
import { app } from "../../firebase/config.js";
import { useParams } from "react-router";

export function useTournament() {
  const { seed } = useParams();
  const [tournament, setTournament] = useState(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase(app);

    const tournamentRef = ref(db, '/TournamentList/' + seed + '/Tournament');

    const unsubscribe = onValue(tournamentRef, (snapshot) => {
      setTournament(snapshot.val());
      setLoading(false);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      off(tournamentRef);
    };
  }, []);

  const generateBalancedMatches = (players, playersForMatch, matchesForPlayer) => {
    let playerKeys = Object.keys(players); // ['A', 'B', 'C', ...]

    let matches = [];

    // Generar todas las combinaciones posibles únicas de jugadores
    const getCombinations = (arr, k) => {
        if (k === 0) return [[]];
        if (arr.length < k) return [];
        const [first, ...rest] = arr;
        const withFirst = getCombinations(rest, k - 1).map(comb => [first, ...comb]);
        const withoutFirst = getCombinations(rest, k);
        return [...withFirst, ...withoutFirst];
    };

    // // Crea un set de combinaciones únicas como strings ordenadas para evitar repeticiones
    var combinations = getCombinations(playerKeys, playersForMatch)
         .map(group => group.sort().join(','));

    var playerMatchCount = Object.fromEntries(playerKeys.map(p => [p, 0]));
    const combinationsLength = combinations.length;

    // numero de matches possibles con el maximo de jugadores y parametros
    var maxMatches = parseInt((playerKeys.length * matchesForPlayer) / playersForMatch);
    var repetitions = 0
    if (maxMatches > combinationsLength) {
      //Add all combinations to matches
      repetitions = parseInt(maxMatches / combinationsLength);
      for (let i = 0; i < repetitions; i++) {
        // Mezclar las combinaciones para evitar patrones repetitivos
        matches.push(...combinations.map(combStr => {
          const comb = combStr.split(',');
          comb.forEach(p => playerMatchCount[p]++);
          return Object.fromEntries(comb.map(p => [p, 0]));
        }));
      }
      maxMatches = maxMatches - (repetitions * combinationsLength)
    }

    var rem = (playerKeys.length * matchesForPlayer) % playersForMatch


    // si queda un solo jugador mirar como redistribuirlo (rem < playersForMatch/2)
    // si podemos evitar hacer jugar un enfrentamiento extra a un jugador mejor
    if (playersForMatch > 2 && (rem < (playersForMatch/2)) && rem !== 0 ) {
      maxMatches -= 1;
      rem += playersForMatch;
    }

    //START NEW RULES

    var enfrontamentsDisponibles = Object.fromEntries(playerKeys.map(p => [p, playerKeys.filter(el => el !== p)]))
    var playerVsRepeats = Object.fromEntries(playerKeys.map(p => [p, []]))
    var keysUtilitzadesEnfrontaments = [];
    for (let i = 0; i < maxMatches; i++) {
      var minMatches = Math.min(...Object.values(playerMatchCount));
      var playersWithLessMatches = Object.entries(playerMatchCount)
        .filter(([player, count]) => count === minMatches)
        .map(([player, _]) => player);

      var randomIndex = Math.floor(Math.random() * playersWithLessMatches.length);
      var comb = []
      var playerSelected = playersWithLessMatches[randomIndex];
      comb.push(playerSelected)
      var leftvsSel = enfrontamentsDisponibles[playerSelected].filter(d => playersWithLessMatches.includes(d));
      var extraPlayers = [];
      var specialPlayersAdd = false;
      var specialPlayersAddFirst = false;
      if (leftvsSel.length >= (playersForMatch - 1)) {
        for (var m = 0; m < (playersForMatch - 1); m++) {
          var rndmIndx = Math.floor(Math.random() * leftvsSel.length);
          var plyrSlctd = leftvsSel[rndmIndx];
          leftvsSel.splice(rndmIndx, 1)
          comb.push(plyrSlctd)
        }
      } else {
        var playersLeft = playersForMatch - leftvsSel.length - 1
        for (var m = 0; m < leftvsSel.length; m++) {
          comb.push(leftvsSel[m])
        }

        //review aqui
        var playersWithSomeLessMatches = Object.entries(playerMatchCount)
        .filter(([player, count]) => count === (minMatches + 1))
        .map(([player, _]) => player);

        var stillPlayers = playersWithLessMatches.filter(el => !comb.includes(el))
        if (stillPlayers.length === 0) {
          leftvsSel = enfrontamentsDisponibles[playerSelected]?.filter(d => !comb.includes(d) && playersWithSomeLessMatches.includes(d));
        } else {
          leftvsSel = stillPlayers
        }
        for (var m = 0; m < playersLeft; m++) {
          if (stillPlayers.length === 0) {
            specialPlayersAddFirst = true
            leftvsSel = enfrontamentsDisponibles[playerSelected]?.filter(d => !comb.includes(d) && playersWithSomeLessMatches.includes(d));
            if (leftvsSel.length === 0) {
              specialPlayersAdd = true
              leftvsSel = playerKeys.filter(d => !comb.includes(d) && !playerVsRepeats[playerSelected].includes(d))
            }
          }
          var rndmIndx = Math.floor(Math.random() * leftvsSel.length);
          var plyrSlctd = leftvsSel[rndmIndx];
          leftvsSel.splice(rndmIndx, 1)
          comb.push(plyrSlctd)
          //recollir aquests extras per filtrar despres
          if (specialPlayersAddFirst) {
            playerVsRepeats[playerSelected].push(plyrSlctd)
          }
          if (specialPlayersAdd) extraPlayers.push(plyrSlctd)
        }
      }

      if (keysUtilitzadesEnfrontaments.includes(comb.sort().join(''))) {
        i--;
      } else {
        //eliminar possibilitats de la combinacio escollida
        comb.forEach(el => {
          var otherComb = comb.filter(a => a !== el)
          //si no s'inclu la lletra guardar en playerVsRepeats
          var notFoundElement = enfrontamentsDisponibles[el].find(x => !enfrontamentsDisponibles[el].includes(x))
          if (notFoundElement) {
            debugger
              playerVsRepeats[el].push(notFoundElement)
          }
          enfrontamentsDisponibles[el] = enfrontamentsDisponibles[el]?.filter(ke => !otherComb.includes(ke))
          playerMatchCount[el]++
          //si esta buit fer refresh de la taula
          if (!enfrontamentsDisponibles[el] || enfrontamentsDisponibles[el].length === 0) {
            enfrontamentsDisponibles[el] = playerKeys.filter(v => v !== el && !playerVsRepeats[el].includes(v) && !extraPlayers.includes(v))
            playerVsRepeats[el] = []
          }
        })
        matches.push(Object.fromEntries(comb.sort().map(p => [p, 0])));
        keysUtilitzadesEnfrontaments.push(comb.sort().join(''))
      }

      //OLD LOGICS
        // suggestedCombinations = JSON.parse(JSON.stringify(combinations));
        // var minMatches = Math.min(...Object.values(playerMatchCount));
        // var playersWithLessMatches = Object.entries(playerMatchCount)
        //   .filter(([player, count]) => count === minMatches)
        //   .map(([player, _]) => player);
       
        //   // Si hay jugadores con menos partidos, filtrar combinaciones que no los incluyan      


        // if (playersWithLessMatches.length !== Object.keys(playerMatchCount).length) {
        //   // filtrar combinaciones que incluyan jugadores con menos partidos
        //   suggestedCombinations = suggestedCombinations.filter(combStr => {
        //   var combi = combStr.split(',');
        //   //AQUI SOME O EVERY
        //   return combi.some(b => playersWithLessMatches.includes(b));
        // });
        // }

        // if (suggestedCombinations.length === 0) {
        //   suggestedCombinations = JSON.parse(JSON.stringify(combinations))
        // }

        // var randomIndex = Math.floor(Math.random() * suggestedCombinations.length);
        // var combStr = suggestedCombinations[randomIndex];
        // var comb = combStr.split(',');
        // matches.push(Object.fromEntries(comb.map(p => [p, 0])));
        // comb.forEach(p => playerMatchCount[p]++);
        // combinations.splice(combinations.indexOf(suggestedCombinations[randomIndex]), 1)
        // //Si un player llega al maximo de partidos, eliminar todas las combinaciones que lo incluyan en combinations
        // comb.forEach(p => {
        //   if (playerMatchCount[p] === matchesForPlayer) {
        //     combinations = combinations.filter(c => !c.includes(p));
        //   }
        // });
    }

    var remainingPlayers = playerKeys.filter(p => playerMatchCount[p] < matchesForPlayer);
    //check quin jugadors porten menys partits per pillarlos en el següent match

    minMatches = Math.min(...Object.values(playerMatchCount));
    playersWithLessMatches = Object.entries(playerMatchCount)
          .filter(([player, count]) => count === minMatches)
          .map(([player, _]) => player);

    
    let playersMatch = []

    if (rem < playersForMatch) {
      if (rem === 1) {
      //crear ronda especial con un jugador repitiendo
        var playerWithoutMatch 
        let match = remainingPlayers.map(player => {
          playerMatchCount[player]++
          playerWithoutMatch = player;
          return [player, 0]
        });
        match = Object.fromEntries(match);
        // Repetir un jugador aleatorio para completar el enfrentamiento
        var playerKeys2 = Object.keys(players)
        playerKeys2 = playerKeys2.filter(p => p !== playerWithoutMatch);
        const randomPlayer = playerKeys2[Math.floor(Math.random() * playerKeys2.length)];
        playerMatchCount[randomPlayer]++;
        match[randomPlayer] = 0;
        match['specialRoundPlayer'] = randomPlayer;
        matches.push(match);
      }
      else if (rem > 0) {
        let match = remainingPlayers.map(player => {
          playerMatchCount[player]++
          return [player, 0]
        });
        matches.push(Object.fromEntries(match));
      }
    } else {
      let playersForced = 0
      let forcedPlayersMatch = []
      if (playersWithLessMatches.length < remainingPlayers.length) {

        forcedPlayersMatch = playersWithLessMatches
            .splice(0, playersWithLessMatches.length)
            .map(player => {
              playersForced += 1
              remainingPlayers = remainingPlayers.filter(p => p !== player)
              return player;
            })
      }
      //fer 2 partits
       if (rem % 2 === 0) {
          var newSizeMatches = rem / 2
          playersMatch = remainingPlayers
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
            .splice(0, (newSizeMatches - playersForced));
            playersMatch = playersMatch.concat(forcedPlayersMatch)
            let match = playersMatch.map(player => {
            playerMatchCount[player]++;
            return [player, 0];
          });
          matches.push(Object.fromEntries(match));
          remainingPlayers = playerKeys.filter(p => playerMatchCount[p] < matchesForPlayer);
          playersMatch = remainingPlayers
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
            .splice(0, newSizeMatches);
          match = playersMatch.map(player => {
            playerMatchCount[player]++;
            return [player, 0];
          });
          matches.push(Object.fromEntries(match));
          
        } else {
          var newSizeMatches = Math.floor(rem / 2)
          playersMatch = remainingPlayers
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
            .splice(0, (newSizeMatches + 1 - playersForced));
            playersMatch = playersMatch.concat(forcedPlayersMatch)
            let match = playersMatch.map(player => {
            playerMatchCount[player]++;
            return [player, 0];
          });
          matches.push(Object.fromEntries(match));
          remainingPlayers = playerKeys.filter(p => playerMatchCount[p] < matchesForPlayer);
          playersMatch = remainingPlayers
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
            .splice(0, newSizeMatches);
          match = playersMatch.map(player => {
            playerMatchCount[player]++;
            return [player, 0];
          });
          matches.push(Object.fromEntries(match));
        }
    }
    return {Round1: matches};
};


  const setTournamentConfig = async (tournamentData) => {
    try {
        const db = getDatabase(app);
        const tournamentRef = ref(db, '/TournamentList/' + seed + `/`);

        // Mantener jugadores existentes si hay, o crear nuevos
        const players = Array.from({ length: tournamentData.numPlayers })
            .reduce((acc, _, i) => {
                const slot = String.fromCharCode(65 + i);
                acc[slot] = tournament?.Players?.[slot] || "";
                return acc;
            }, {});

        // Generar automáticamente los partidos de la primera ronda si no existen
        let matches = tournament?.Matches || { Round1: [] };
        //Si modifiques numero de jugadors, jugadors per partit o partits per jugador reset a matches
        if ((tournamentData.matchesForPlayer && tournament?.matchesForPlayer && tournamentData.matchesForPlayer !== tournament.matchesForPlayer) || (tournamentData.playersForMatch && tournament?.playersForMatch && tournamentData.playersForMatch !== tournament.playersForMatch) || (tournamentData.numPlayers && tournament?.numPlayers && tournamentData.numPlayers !== tournament.numPlayers) || (tournamentData.type && tournament?.type && tournamentData.type !== tournament.type)) {
          delete tournament.Matches;
          delete tournament.leagueScore;
        }
        if (!tournament?.Matches && tournamentData.type === "Tournament") {
            matches.Round1 = Object.keys(players)
                .map((player, index, arr) => {
                    return index % 2 === 0 && arr[index + 1]
                        ? { [player]: "0", [arr[index + 1]]: "0" }
                        : null;
                })
                .filter(match => match !== null);
        } else if (!tournament?.Matches && (tournamentData.type === "League" || tournamentData.type === "League+Tournament")) {
            const matchesLeague = generateBalancedMatches(players, tournamentData.playersForMatch, tournamentData.matchesForPlayer);
            console.log(matchesLeague);
            matches = matchesLeague
        }

        

        var leagueScore = {}
        if ((tournamentData.type === "League" || tournamentData.type === "League+Tournament")) {
          if (tournament?.leagueScore) {
            leagueScore = tournament.leagueScore;
          } else {
            leagueScore = Object.fromEntries(Object.keys(players).map(([key]) => [key, 0]))
          }
        }

        // Guardar la configuración actualizada en Firebase
        await update(tournamentRef, {
          Tournament: {
            Players: players,
            name: tournamentData.name,
            type: tournamentData.type,
            currentType: tournamentData.type === 'League+Tournament' && 'League' || null,
            numPlayers: tournamentData.numPlayers,
            Matches: matches,
            imgTournament: tournamentData.imgTournament !== "" ? tournamentData.imgTournament : null,
            imgTournamentOrg: tournamentData.imgTournamentOrg !== "" ? tournamentData.imgTournamentOrg : null,
            orgName: tournamentData.orgName !== "" ? tournamentData.orgName : null,
            playersForMatch: (tournamentData.type === 'League' || tournamentData.type === 'League+Tournament') && tournamentData.playersForMatch || null,
            scoreForPos: (tournamentData.type === 'League' || tournamentData.type === 'League+Tournament') && tournamentData.scoreForPos || null,
            leagueScore: (tournamentData.type === 'League' || tournamentData.type === 'League+Tournament') && leagueScore || null,
            matchesForPlayer: (tournamentData.type === 'League' || tournamentData.type === 'League+Tournament') && tournamentData.matchesForPlayer || null,
            resultsAsPositions: tournamentData.resultsAsPositions || null,
            themeStyle: tournamentData.themeStyle || 'taverna',
            numPlayersForTournament: tournamentData.type === 'League+Tournament' && tournamentData.numPlayersForTournament || null,
          }
        });
    } catch (error) {
        console.error("Failed to update tournament configuration", error);
        throw error;
    }
};


  const deleteTournament = async () => {
    try {
      const db = getDatabase(app);
      const tournamentMatchesRef = ref(db, '/TournamentList/' + seed + '/Tournament/Matches');
      const tournamentleagueScoreRef = ref(db, '/TournamentList/' + seed + '/Tournament/leagueScore');
      const tournamentPlayersRef = ref(db, '/TournamentList/' + seed + '/Tournament/Players');
      const tournamentNumPlayersRef = ref(db, '/TournamentList/' + seed + '/Tournament/numPlayers');
      await remove(tournamentMatchesRef);
      await remove(tournamentleagueScoreRef);
      await remove(tournamentPlayersRef);
      await remove(tournamentNumPlayersRef);
        // reload the current page
        window.location.reload();
    } catch (error) {
        console.error("Failed to delete tournament", error);
        throw error;
    }
  };

    const deleteMatches = async () => {
    try {
        const db = getDatabase(app);
        const tournamentRef = ref(db, '/TournamentList/' + seed + `/Tournament/Matches`);
        await remove(tournamentRef);
    } catch (error) {
        console.error("Failed to delete tournament matches", error);
        throw error;
    }
  };

  const deleteLeagueScore = async () => {
    try {
        const db = getDatabase(app);
        const tournamentRef = ref(db, '/TournamentList/' + seed + `/Tournament/leagueScore`);
        await remove(tournamentRef);
    } catch (error) {
        console.error("Failed to delete tournament leagueScore", error);
        throw error;
    }
  };
  

  const setPlayersConfig = async (players) => {
    try {
      const db = getDatabase(app);
      const tournament = ref(db, '/TournamentList/' + seed + `/Tournament`);

      await update(tournament, { Players: players });
    } catch (error) {
      console.error("Failed to update match score:", error);
      throw error;
    }
  };

  const setMatchesScore = async (matches, type, players, scoreForPos, resultsAsPositions, currentType) => {
    try {
      const db = getDatabase(app);
      const tournament = ref(db, '/TournamentList/' + seed + `/Tournament`);

      if (type === "Tournament" || type === "League+Tournament" && currentType === "Tournament") {
        await update(tournament, { Matches: matches });
      }
      else if (type === "League" || type === "League+Tournament" && currentType === "League") {
        // En el caso de la liga, actualizamos los scores de los jugadores
        var leagueScore = Object.fromEntries(Object.keys(players).map(([key]) => [key, 0]))
        //Object.keys(players).map(([key]) => {key, 0});
        Object.values(matches.Round1).map((match, i) => {
          var data = {...match}
          if (match.hasOwnProperty('specialRoundPlayer')) {
            delete data.specialRoundPlayer
          }
          var ranking = {};
          const values = Object.values(data)
          if (values.every(v => v === 0)) {
            ranking = undefined;
          } else {
            
            let currentRank = 1;
            let prevValue = null;
            let skip = 0;
            var sortedEntries
            if (!resultsAsPositions) {
              sortedEntries = Object.entries(data).sort(([, v1], [, v2]) => v2 - v1);
              sortedEntries.forEach(([key, value], index) => {
                if (value === prevValue) {
                  skip++;
                } else {
                  currentRank = index + 1;
                  currentRank += skip;
                  skip = 0;
                }
                ranking[key] = currentRank;
                prevValue = value;
              });
            } else {
              ranking = data
            }

            console.log(ranking);
          }
          if (ranking) {
            Object.entries(ranking).map(([playerId, rank]) => {
              if (match.hasOwnProperty('specialRoundPlayer') && match.specialRoundPlayer === playerId) return;
              leagueScore[playerId] += (scoreForPos ? scoreForPos[rank - 1] : 0);
            })
          }
        })
        //sort leagueScore by value
        const sortedArray = Object.entries(leagueScore).sort(([, v1], [, v2]) => v2 - v1);
        const sortedObject = Object.fromEntries(sortedArray);
        await update(tournament, { Matches: matches, leagueScore: sortedObject });
      }
    } catch (error) {
      console.error("Failed to update match score:", error);
      throw error;
    }
  };

  const transformMatchesToRounds = (matches, theme, resultsAsPositions) => {
    const rounds = Object.keys(matches)
      .filter((key) => key.startsWith("Round"))
      .sort((a, b) => {
        // Ordenar por número de ronda
        const numA = parseInt(a.replace("Round", ""), 10);
        const numB = parseInt(b.replace("Round", ""), 10);
        return numA - numB;
      })
      .map((roundKey, roundIndex) => {
        const roundMatches = matches[roundKey];
  
        return {
          title: `Ronda ${roundIndex + 1}`,
          seeds: roundMatches.map((match, matchIndex) => {
            const players = Object.keys(match);
            return {
              theme: theme,
              resultsAsPositions: resultsAsPositions,
              id: matchIndex + 1,
              teams: players.map((playerId) => ({
                name: tournament.Players[playerId],
                score: Number(match[playerId]),
              })),
            };
          }),
        };
      });
    return rounds;
  };
  

  const startTournamentAfterLeague = async (tournamentData) => {
    const db = getDatabase(app);
    const tournamentRef = ref(db, '/TournamentList/' + seed + `/Tournament`);
    var players = Object.entries(tournamentData.leagueScore).sort(
            ([, v1], [, v2]) => v2 - v1
          ).splice(0, tournamentData.numPlayersForTournament).map(el => el[0])
          

    let matches = { Round1: [] };
    const result = players.slice(0, players.length / 2).map((item, i) => {
      return {
        [item]: 0,
        [players[players.length - 1 - i]]: 0
      };
    })

    matches.Round1 = result

    await update(tournamentRef, {
            currentType: 'Tournament',
            leagueMatches: tournamentData.Matches,
            Matches: matches,
    });
  }

  
  return { loading, tournament, setTournamentConfig, setPlayersConfig, setMatchesScore, deleteTournament, deleteMatches, deleteLeagueScore, transformMatchesToRounds, generateBalancedMatches, startTournamentAfterLeague };
}
