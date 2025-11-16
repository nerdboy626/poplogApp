import { useParams } from "react-router-dom";
import "./MediaDetails.css";

const MediaDetails = () => {
  const { mediaType, id } = useParams();
  return <div>{`${mediaType}, ${id}`}</div>;
};

export default MediaDetails;
