import { Link } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import "./Greeting.css";
const Greeting = () => {
  const auth = useAuth();
  return (
    <div className="greeting">
      {auth.isLoggedIn ? (
        <h2>Greetings {auth.user.username}!</h2>
      ) : (
        <h2>
          Greetings guest! Please click <Link to="/login">here</Link> to log in!
        </h2>
      )}
    </div>
  );
};

export default Greeting;
