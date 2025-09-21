import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, off, update, remove } from "firebase/database";
import { app } from "../../firebase/config.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

export function useGlobalDB() {
    const [tournamentdb, setTournamentdb] = useState(null);
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null);
    const auth = getAuth();

    useEffect(() => {
        const db = getDatabase(app);
        const tournamentRef = ref(db, `/TournamentList`);
        const unsubscribe = onValue(tournamentRef, (snapshot) => {
          setTournamentdb(snapshot.val());
          setLoading(false)
        });
        // Cleanup on unmount
        return () => {
          unsubscribe();
          off(tournamentRef);
        };
      }, []);

    const generateUniqueKey = async (keywords) => {
        const db = getDatabase(app);
        const tournamentdbRef = ref(db, `/TournamentList/`);

        const generateRandomString = (length) =>
            [...Array(length)]
            .map(() => Math.random().toString(36)[2])
            .join('');

        const randomPart = generateRandomString(keywords ? 10 : 15);
        const key = keywords ? `${keywords}-${randomPart}` : `zzrndm-${randomPart}`;

        console.log(key);
        navigator.clipboard.writeText('https://tournament-e57c8.web.app/' + key)

        //Data de creacio

        const now = new Date(Date.now());
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Meses van de 0 a 11
        const year = now.getFullYear();

        const formattedDate = `${day}-${month}-${year}`;

        await update(tournamentdbRef, {
            [key]: {
                Tournament: {
                    name: '',
                },
                creationDate: formattedDate,
                creator: auth.currentUser.email,
            }
        })
        setTimeout(() => {
            window.location.assign(
            "https://tournament-e57c8.web.app/" + key + "/admin"
            );
        }, 2500)
    };

    const deleteTournamentKey = async (key) => {
        try {
            const db = getDatabase(app);
            const tournamentRef = ref(db, '/TournamentList/' + key);
            await remove(tournamentRef);
        } catch (error) {
            console.error("Failing delete tournament key", error);
            throw error;
        }
    }

    const loginAdmin = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        // ...
        console.log(userCredential);
      })
      .catch((error) => {
        console.log('mal')
        const errorCode = error.code;
        const errorMessage = error.message;
        throw error;
    });
  }

  onAuthStateChanged(auth, (u) => {
    if (u) {
      if (!user) {
        setUser(u)
        console.log("Usuario activo:", u);
      }
      
    } else {
      console.log("Nadie ha iniciado sesión");
    }
  });

  const logoutAdmin = () => {
    signOut(auth).then(() => {
      setUser(null)
      // Sign-out successful.
    }).catch((error) => {
      // An error happened.
    });
  }

    return { loading, tournamentdb, generateUniqueKey, deleteTournamentKey, loginAdmin, logoutAdmin, user};
}