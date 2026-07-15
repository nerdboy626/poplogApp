import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../config/env";
export default function useGameGenres() {
  const [gameGenres, setGameGenres] = useState([]);

  useEffect(() => {
    async function fetchGameGenres() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/games/genres`);
        const data = await res.json();
        setGameGenres(data);
      } catch (err) {
        console.error("fetchGameGenres error:", err);
      }
    }

    fetchGameGenres();
  }, []);

  return gameGenres;
}
