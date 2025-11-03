import { useAuth } from "../utils/AuthContext.jsx";
const Dashboard = () => {
  const auth = useAuth();
  return (
    <div>
      <h1>Dashboard Page</h1>
      <br></br>
      <p>Welcome {auth.user.username}</p>
    </div>
  );
};

export default Dashboard;
