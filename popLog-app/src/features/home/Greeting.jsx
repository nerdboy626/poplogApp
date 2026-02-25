import { Link } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import "./Greeting.css";
const Greeting = () => {
  const auth = useAuth();
  return (
    <div className="greeting">
      {auth.isLoggedIn ? (
        <>
          <h1>Welcome back</h1>
          <p className="subtitle">Here’s what people are loving right now</p>
        </>
      ) : (
        <>
          <h1>Discover what’s trending</h1>
          <p className="subtitle">
            Track your favorites by <Link to="/login">signing in</Link>
          </p>
        </>
      )}
    </div>
  );
};

export default Greeting;
