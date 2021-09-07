import s from './EditPet.module.css';
import React, { useEffect, useState } from 'react';
import axios from '../../axiosInterceptor';
import { useDispatch, useSelector } from 'react-redux';
import { closeCircleOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { Link, useHistory } from 'react-router-dom';
import loading from '../../img/loadingGif.gif';
import { getTemperaments, showMessage, validURL, getUserInfo, getDogsNames } from '../../extras/globalFunctions';
import { setUser } from '../../actions';
import 'react-toastify/dist/ReactToastify.css';
import { uploadConfirmedDogBreedImage, uploadDogBreedImage } from '../../extras/firebase';
import loadingHorizontal from '../../img/loadingHorizontalGif.gif';
import { Modal } from 'react-bootstrap'

export default function EditPet({ id }) { // si me psan el di seleccionar la raza automáticmanete si no mostrrar seleccionar raza en el <select
    // Redux states
    const user = useSelector(state => state.user);

    // Own states
    const [pet, setPet] = useState({})
    const [name, setName] = useState('')
    const [nameErr, setNameErr] = useState('')
    const [buttonState, setButtonState] = useState(true)
    const [errGlobal, setErrGlobal] = useState('')
    const [mainErr, setMainErr] = useState('')
    const [photo, setPhoto] = useState('https://firebasestorage.googleapis.com/v0/b/dogsapp-f043d.appspot.com/o/folder-open-outline.svg?alt=media&token=e7dacac8-113e-4f25-8339-51c2d49a7181')
    const [errPhoto, setErrPhoto] = useState('')
    const [changedPhoto, setChangedPhoto] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [dogs, setDogs] = useState([])
    const [dogId, setDogId] = useState('default')
    const [selectedDog, setSelectedDog] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [imageFile, setImageFile] = useState(null);

    // Variables
    const history = useHistory();
    const dispatch = useDispatch();

    // Hooks 

    // This hook allow us to load the logued user
    useEffect(() => {
        const cancelToken = axios.CancelToken;
        const source = cancelToken.source();
        async function updateUser() {
            const user = await getUserInfo(source.token);
            if (user !== "Unmounted") {
                dispatch(setUser(user))
            }
        }
        updateUser();
        return () => source.cancel("Unmounted");
    }, [dispatch])

    // This hook load the pet data
    useEffect(() => {
        async function findPet(id) {
            try {
                let response = await axios.get(`/pets/${id}`);
                const { name, photo, dog } = response.data
                setPet({ name, photo, dogId: dog.id });
                setName(name);
                setPhoto(photo);
                setDogId(dog.id);
            } catch (e) {
                if (e.response.status === 404 && e.response.data === `There is no pet with the id ${id}`) return setMainErr(e.response.data)
                setMainErr('Sorry, an error ocurred')
            }
        }
        findPet(id);
    }, [id])

    // This hook is to enable or disable the submit button
    useEffect(() => {
        if (uploading || nameErr || !name || !photo || dogId === 'default' || (name === pet.name && photo === pet.photo && parseInt(dogId) === pet.dogId)) return setButtonState(true);
        return setButtonState(false);
    }, [uploading, nameErr, name, photo, dogId])

    // This hook is to get the dogs name
    useEffect(() => {
        const cancelToken = axios.CancelToken;
        const source = cancelToken.source();
        async function requesting() {
            const dogs = await getDogsNames(source.token)
            if (dogs !== "Unmounted") {
                dogs.length ? setDogs(dogs) : setMainErr('Sorry, an error ocurred')
            }
        }
        requesting();
        return () => source.cancel("Unmounted");
    }, [dispatch])

    // This hook allows us to get the dog information of the selected dog breed in order to display this data to the user
    useEffect(() => {
        async function findDog(dogId) {
            try {
                let response = await axios.get(`http://localhost:3001/dogs/${dogId}`);
                setSelectedDog(response.data);
            } catch (e) {
                if (e.response.status === 404 && e.response.data === `There is no dog breed with the id ${dogId}`) return showMessage(e.response.data)
                showMessage('Sorry, an error ocurred')
            }
        }
        if (dogId !== 'default') findDog(dogId);
    }, [dogId])

    // Functions

    // This function allows us to handle changes in the form
    function handleChange(e) {
        let value = e.target.value;
        !value ? setNameErr('This field is required') : setNameErr('')
        return setName(value)
    }

    // This function allows us to handle the submit of the form
    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setGuardando(true);
            let confirmedImageUrl = pet.photo;
            if (imageFile) {
                confirmedImageUrl = await uploadConfirmedDogBreedImage(id, imageFile)
                if (!validURL(confirmedImageUrl)) {
                    setPhoto(pet.photo);
                    setErrGlobal(`Sorry, we could not save the image you provided for ${pet.name}`);
                    return setChangedPhoto(false);
                }
            }
            const response = await axios.put('/pets', {
                id,
                name,
                photo: confirmedImageUrl,
                dogId
            })
            showMessage(response.data);
            history.push(`/detail/${dogId}`);
        } catch (e) {
            return setErrGlobal(e.response.data);
        }
    }

    // This function allows us to upload the dog breed picture
    async function changePhoto(e) {
        if (e.target.files[0]) {
                setUploading(true)
                const urlPhoto = await uploadDogBreedImage(id, e.target.files[0])
                setUploading(false);
                if (validURL(urlPhoto)) {
                    setImageFile(e.target.files[0]);
                    setPhoto(urlPhoto);
                    setChangedPhoto(true);
                } else {
                    setErrPhoto(urlPhoto)
                }
        }
    }

    return (
        <>
            <div className={s.container}>
                {!mainErr ?
                    user ?
                        Object.keys(user).length ?
                            <div className={s.content}>
                                <h1 className={s.title}>Edit pet</h1>


                                <div className={s.errorGlobalContainer}>
                                    {errGlobal ? <p className={s.errorGlobal}>{errGlobal}</p> : null}
                                </div>

                                <form onSubmit={handleSubmit} className={s.form}>
                                    <div className={nameErr ? '' : 'mb-3'}>
                                        <label className={s.label}>Name</label>
                                        <input value={name} placeholder="Insert name" className={nameErr ? s.errorInput : s.formInput} type="text" onChange={handleChange} name="namePet"></input>
                                    </div>
                                    {nameErr ? <small className={s.error}>{nameErr}</small> : null}

                                    {
                                        dogs.length ?
                                            <>
                                                <div className={nameErr ? '' : 'mb-3'}>
                                                    <label className={s.label}>Dog breed</label>
                                                    <div className={s.breedSelectorContainer}>
                                                        <select className={`form-control ${s.breedSelector}`} id="temperamentSelector" value={dogId} onChange={e => setDogId(e.target.value)} name="temperament">
                                                            {dogId === 'default' ? <option key='default' value='default'>Select a dog breed</option> : null}
                                                            {dogs.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                                        </select>
                                                        <button disabled={dogId === 'default'} className={`btn btn-primary ${s.breedMoreInfo}`} onClick={e => { e.preventDefault(); setShowModal(true); }}>More information</button>
                                                    </div>
                                                </div>
                                            </>
                                            :
                                            null
                                    }
                                    <div className={s.profilePictureEditor}>
                                        <label className={s.labelProfile}>Image</label>
                                        <div className={`${s.containerProfileImage} ${errPhoto ? '' : 'mb-3'}`}>
                                            {
                                                uploading ?
                                                    <div className={s.uploadingContainer}>
                                                        <img className={s.uploadingGif} src={loading} alt='Dog breed'></img>
                                                    </div>
                                                    :
                                                    <img className={s.profilePic} src={photo} alt='Dog breed'></img>
                                            }
                                        </div>
                                        {errPhoto ? <small className={s.error}>{errPhoto}</small> : null}
                                        {
                                            !changedPhoto ?
                                                <div className={`w-100 btn btn-primary ${uploading ? 'disabled' : ''}`} onClick={() => document.getElementById('inputFile').click()}>
                                                    <span>Change image</span>
                                                    <input id="inputFile" type="file" className={s.fileInput} onChange={changePhoto} accept="image/png, image/gif, image/jpeg, image/jpg" />
                                                </div>
                                                :
                                                <>
                                                    <div className={`w-100 btn btn-primary mb-3  ${uploading ? 'disabled' : ''}`} onClick={() => { document.getElementById('inputFileExtra').click() }}>
                                                        <span>Change image</span>
                                                        <input id="inputFileExtra" type="file" className={s.fileInput} onChange={changePhoto} accept="image/png, image/gif, image/jpeg, image/jpg" />
                                                    </div>

                                                    <button className={`w-100 btn btn-secondary`} disabled={uploading} onClick={async () => { setImageFile(null); setUploading(false); setErrPhoto(''); setChangedPhoto(false); setPhoto(pet.photo); }}>Cancel changes</button>
                                                </>
                                        }
                                    </div>



                                    {
                                        guardando ?
                                            <div className={`w-100 btn btn-primary disabled`}>
                                                <img src={loadingHorizontal} className={s.loadingHorizontal} alt='Loading'></img>
                                            </div>
                                            :
                                            <input type="submit" value="Save changes" disabled={buttonState} className={`w-100 btn btn-primary`} />
                                    }
                                </form>
                            </div>
                            :
                            <div className={s.contentCenter}>
                                <p>To be able to register your pet you need to be logged in.</p>
                                <Link to="/login" className={s.loginButton}>Log in</Link>
                            </div>
                        :
                        <div className={s.contentCenter}>
                            <img className={s.loading} src={loading} alt='loadingGif'></img>
                        </div>
                    :
                    <div className={s.contentCenter}>
                        <div className={s.errorGlobalContainer}>
                            <p className={s.errorMain}>{mainErr}</p>
                        </div>
                    </div>
                }
            </div>
            {
                Object.keys(selectedDog).length ?
                    <Modal
                        show={showModal}
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        keyboard={false}
                        onHide={() => setShowModal(false)}
                    >
                        <Modal.Header>
                            <Modal.Title id="contained-modal-title-vcenter">
                                {selectedDog.name}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className={s.modalBody}>
                            <img src={selectedDog.image} className={s.image} alt={selectedDog.name}></img>
                            {selectedDog.temperament ?
                                <>
                                    <span className={s.label}>Temperament :</span>
                                    <div className={s.temperamentsContainer}>
                                        {selectedDog.temperament.split(', ').map((e, i) =>
                                            <div key={i} className={s.test}>
                                                <div className={s.temperament}>{e}</div>
                                            </div>
                                        )}
                                    </div>
                                </>
                                :
                                null
                            }
                            {
                                selectedDog.height ?
                                    <div>
                                        <span className={s.label}>Height :</span>
                                        <p>{selectedDog.height}</p>
                                    </div>
                                    :
                                    null
                            }
                            {
                                selectedDog.weight ?
                                    <div>
                                        <span className={s.label}>Weight :</span>
                                        <p>{selectedDog.weight}</p>
                                    </div>
                                    :
                                    null
                            }
                            {
                                selectedDog.lifespan ?
                                    <div>
                                        <span className={s.label}>Lifespan :</span>
                                        <p>{selectedDog.lifespan}</p>
                                    </div>
                                    :
                                    null
                            }
                            {
                                selectedDog.bred_for ?
                                    <div>
                                        <span className={s.label}>Bred for reason :</span>
                                        <p>{selectedDog.bred_for}</p>
                                    </div>
                                    :
                                    null
                            }
                            {
                                selectedDog.breed_group ?
                                    <div>
                                        <span className={s.label}>Breed group :</span>
                                        <p>{selectedDog.breed_group}</p>
                                    </div>
                                    :
                                    null
                            }
                            {
                                selectedDog.origin ?
                                    <div>
                                        <span className={s.label}>Origin :</span>
                                        <p>{selectedDog.origin}</p>
                                    </div>
                                    :
                                    null
                            }
                        </Modal.Body>
                    </Modal>
                    :
                    null
            }
        </>
    )
}