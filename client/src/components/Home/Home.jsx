import s from './Home.module.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cards from '../Cards/Cards';
import * as actionsCreators from '../../actions';
import { useDispatch, useSelector } from 'react-redux'
import PaginationComponent from '../PaginationComponent/PaginationComponent';
import NavBar from '../NavBar/NavBar';

export default function Home(props) {
  // Dispatch
  const dispatch = useDispatch();

  // Global States
  const finalResultRedux = useSelector(state => state.finalResult);
  const actualPageRedux = useSelector(state => state.actualPage);

  // Local States
  const [dogs, setDogs] = useState([]);
  const [temperaments, setTemperaments] = useState([]);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit] = useState(8);

  // Elements states
  const [searchTerm, setSearchTerm] = useState('');
  const [temperament, setTemperament] = useState('');
  const [property, setProperty] = useState('');

  // When component mounts
  useEffect(() => {
    async function requesting() {
      const completeDogs = await axios.get(`http://localhost:3001/dogs/all`);
      setDogs(completeDogs.data);
      dispatch(actionsCreators.modifyFinalResult(completeDogs.data));
      const temperaments = await axios.get('http://localhost:3001/temperament');
      setTemperaments(temperaments.data);
    }
    requesting();
  }, [dispatch])

  // Filter function
  function filter(e) {
    if (e.target.id !== 'own' && e.target.id !== 'notOwn') { e.preventDefault(); }
    if (dogs.length < 9) return setError('Wait a moment please');
    let componentValue = e.target.value;
    let componentId = e.target.id;
    let finalResult = [];
    let actualsearchterm = searchTerm;
    let actualtemperament = temperament;
    let actualproperty = property;
    if (componentId === 'searchTerm') { actualsearchterm = componentValue; setSearchTerm(componentValue) }
    if (componentId === 'temperament') { actualtemperament = componentValue; setTemperament(componentValue) }
    if (componentId === 'own') { actualproperty = 'own'; setProperty('own') }
    if (componentId === 'notOwn') { actualproperty = 'notOwn'; setProperty('notOwn') }
    if (componentId === 'deleteSearch') { finalResult = dogs; setSearchTerm(''); } else {
      finalResult = dogs.filter((e) => e.name.toLowerCase().includes(actualsearchterm.toLowerCase()))
    }
    if (componentId === 'deleteTemperamentFilter') { setTemperament('') } else {
      finalResult = finalResult.filter(e => e.temperament ? e.temperament.toLowerCase().includes(actualtemperament.toLowerCase()) : false);
    }
    if (componentId === 'deletePropertyFilter') { setProperty('') } else {
      if (actualproperty === "own") {
        finalResult = finalResult.filter(e => e.id >= 265);
      } else if (actualproperty === "notOwn") {
        finalResult = finalResult.filter(e => e.id < 265);
      }
    }
    if (!finalResult.length) setError('Not results found')
    dispatch(actionsCreators.modifyFinalResult(finalResult))
  }

  // HTML estructure
  return (
    <div className={s.container}>
      <h1 className={s.title}>Dog breeds</h1>
      <div className={s.marginTop}>
        <label className={s.label}>Search a breed</label>
        <input className={s.searchInput} id="searchTerm" placeholder="Insert a dog breed" value={searchTerm}
          onChange={e => filter(e)} />
        <button className={s.button} id="deleteSearch" onClick={e => { filter(e) }}>Delete search</button>
      </div>
      <div className={s.marginTop}>
        <label className={s.label}>Filter by temperament</label>
        <select onChange={e => filter(e)} id="temperament" value={temperament} className={s.selectInput}>
          <option key='default' value='default'>Select a temperament</option>
          {temperaments.map((e, i) => <option key={i} value={e}>{e}</option>)}
        </select>
        <button className={s.button} id="deleteTemperamentFilter" onClick={e => { filter(e) }}>Delete filter</button>
      </div>
      <div className={`${s.marginTop} ${s.marginBottom}`}>
        <span className={s.label}>Filter by property</span>
        <div className={s.middleContent}>
          <label><input type="radio" id="own" name="propertyFilter" checked={property === 'own'} onChange={e => filter(e)} className={s.radioOne}/>Show own dogs</label>
          <label className={s.radioTwoInput}><input type="radio" id="notOwn" name="propertyFilter" checked={property === 'notOwn'} onChange={e => filter(e)} className={s.radioTwo}/> Not show own dogs</label>
        </div>
        <button id="deletePropertyFilter" className={s.button} onClick={e => { filter(e) }}>Delete filter</button>
      </div>
      {finalResultRedux.length ? <Cards dogs={actualPageRedux}></Cards> : <p>{error}</p>}
      {finalResultRedux.length ? <PaginationComponent /> : null}
    </div>
  );
}
