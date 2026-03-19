import { Link } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import "./Greeting.css";
const Greeting = () => {
  const auth = useAuth();
  return (
    <header className="greeting">
      {auth.isLoggedIn ? (
        <>
          <h1 className="greeting-title">Welcome back</h1>
          <p className="greeting-subtitle">
            Here’s what people are loving right now
          </p>
        </>
      ) : (
        <>
          <h1 className="greeting-title">Discover what’s trending</h1>
          <p className="greeting-subtitle">
            Track your favorites by <Link to="/login">signing in</Link>
          </p>
        </>
      )}
    </header>
  );
};

export default Greeting;
