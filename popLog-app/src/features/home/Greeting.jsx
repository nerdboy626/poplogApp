import { Link } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import "./Greeting.css";
const Greeting = () => {
  const auth = useAuth();
  return (
    <div className="greeting">
      {auth.isLoggedIn ? (
        <h1>Greetings {auth.user.username}!</h1>
      ) : (
        <h1>
          Greetings guest! Please click <Link to="/login">here</Link> to log in!
        </h1>
      )}
    </div>
  );
};

export default Greeting;
