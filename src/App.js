import { useQuery, gql } from '@apollo/client';
import './App.css';
import { listTodos } from './graphql/queries';
import Todos from './components/Todos';
import InputForm from './components/InputForm';

function App() {
  const { data, loading, error } = useQuery(gql(listTodos));

  if (loading) return <p style={{ textAlign: 'center ' }}>Loading...</p>;
  if (error) return <p style={{ textAlign: 'center ' }}>{error.message}</p>;

  const sortedTodos = [...data?.listTodos?.items].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="App">
      <h1>Todo Apo</h1>
      <InputForm />
      <Todos todos={sortedTodos} />
    </div>
  );
}

export default App;
