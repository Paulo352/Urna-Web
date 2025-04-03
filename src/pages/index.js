import { useAuth } from '../contexts/AuthContext';
import BallotBox from '../components/BallotBox';
import AdminPanel from '../components/AdminPanel';
import login from '../pages/auth/login';

export default function Home() {
  const { currentUser, hasRole } = useAuth();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="container">
      {hasRole('admin') ? (
        <AdminPanel />
      ) : (
        <BallotBox />
      )}
    </div>
  );
}