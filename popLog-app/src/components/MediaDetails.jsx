import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./MediaDetails.css";

const MediaDetails = () => {
  const { mediaType, id } = useParams();
  const [mediaInfo, setMediaInfo] = useState([]);

  useEffect(() => {
    fetchMediaInfo(mediaType, id);
  }, []);

  async function fetchMediaInfo(category, mediaId) {
    let baseUrl = ``;

    if (category === "movie" || category === "tv") {
      baseUrl = `http://localhost:3500/api/movies/details/${category}/${mediaId}`;
    } else {
      baseUrl = `http://localhost:3500/api/${category}/details/${mediaId}`;
    }

    console.log(`Searching ${category} for ${mediaId}`);

    const response = await fetch(baseUrl);

    const data = await response.json();

    console.log(data);

    setMediaInfo(data);
  }

  return <div>{`${mediaType}, ${id}`}</div>;
};

export default MediaDetails;
