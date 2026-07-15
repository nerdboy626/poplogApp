import "./Loading.css";
const Loading = ({ text }) => {
  return (
    <main className="loading-page">
      <section className="loading-card">
        <div className="loading-card__spinner" />
        <p>{!text ? "Loading..." : text}</p>
      </section>
    </main>
  );
};

export default Loading;
