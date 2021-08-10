import s from './App.module.css';
import Home from './components/Home/Home'
import Detail from './components/Detail/Detail';
import Create from './components/Create/Create';
import About from './components/About/About';
import NavBar from './components/NavBar/NavBar';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import { Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <NavBar/>
      <div className={s.marginTop}>
      <Route path="/home" component={Home} />
      <Route path="/detail/:id" render={({ match }) => <Detail id={match.params.id} />} />
      <Route path="/create" component={Create} />
      <Route path="/about" component={About}/>
      <Route path="/login" component={Login}/>
      <Route path="/signup" component={Signup}/>
      </div>
    </div>
  );
}

export default App;
