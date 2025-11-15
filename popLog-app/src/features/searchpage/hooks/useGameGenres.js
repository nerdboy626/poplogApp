import { useEffect, useState } from "react";

export default function useGameGenres() {
  const [gameGenres, setGameGenres] = useState([]);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await fetch("http://localhost:3500/api/games/genres");
        const data = await res.json();
        setGameGenres(data);
      } catch (err) {
        console.error("Failed to load IGDB genres", err);
      }
    }

    fetchGenres();
  }, []);

  return gameGenres;
}
