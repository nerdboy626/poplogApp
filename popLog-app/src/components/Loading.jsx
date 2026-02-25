import "./Loading.css";
const Loading = ({ text }) => {
  return (
    <div className="loading-page">
      <div className="spinner-card">
        <div className="spinner" />
        <p>{!text ? "Loading..." : text}</p>
      </div>
    </div>
  );
};

export default Loading;
