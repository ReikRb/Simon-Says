import { useState, useEffect, useRef } from "react";
import useSound from 'use-sound';
import simon from './assets/sounds/sprite.mp3';
import tavern from './assets/imgs/tavern.png';
import yellow from './assets/imgs/simon_yellow.png';
import blue from './assets/imgs/simon_blue.png'
import red from './assets/imgs/simon_red.png';
import green from './assets/imgs/simon_green.png'
import fail from './assets/imgs/fail.png'
import outside from './assets/imgs/outside.png'
import './App.css'

function App(){

const blueRef   = useRef(null);
const yellowRef = useRef(null);
const greenRef  = useRef(null);
const redRef    = useRef(null);

const [play] = useSound(simon, {
  sprite: {
    one: [0, 500],
    two: [1000, 500],
    three: [2000, 500],
    four: [3000, 500],
    error: [4000, 1000]
  },
});

const colors = [
  {
    color: '#030AFA',
    ref: blueRef,
    sound: 'one',
    img: blue
  },
  {
    color: '#0aFA03',
    ref: greenRef,
    sound: 'two',
    img: green
  },
  {
    color: '#FA0E03',
    ref: redRef,
    sound: 'three',
    img: red
  },
  {
    color: '#FAF303',
    ref: yellowRef,
    sound: 'four',
    img: yellow
  }
];

const minNumber = 0;
const maxNumber = 3;
const initSpeed = 500;
const speedGame = initSpeed;
const speedIncrease = 75
const minSpeed = 150
const maxDiffulty = (speedGame - minSpeed) / speedIncrease
const imageUrls = [tavern, fail, red, blue, green, yellow];

const [sequence, setSequence] = useState([]);
const [currentGame, setCurrentGame] = useState([]);
const [isAllowedToPlay, setIsAllowedToPlay] = useState(false);
const [speed, setSpeed] = useState(speedGame);
const [turn, setTurn] = useState(0);
const [pulses, setPulses] = useState(0); 
const [success, setSuccess] = useState(0);
const [isGameOn, setIsGameOn] = useState(false);
const [backgroundImage, setBackgroundImage] = useState(outside);
const [imagesLoaded, setImagesLoaded] = useState(false);
const [record, setRecord] = useState(1)
const [difficulty, setDifficulty] = useState(1)

useEffect(() => {
  preloadImages();
}, []);
  
useEffect(() =>{
  if (pulses > 0) {
    if (Number(sequence[pulses - 1]) === Number(currentGame[pulses- 1])) {
      setSuccess(success + 1);
    } else{
      const index = sequence[pulses-1]
      if (index) setBackgroundImage(fail);
      play({id:'error'})
      setTimeout(()=>{
        if (index) setBackgroundImage(outside);
        setIsGameOn(false);
        if (record < Math.ceil(turn)) setRecord(Math.ceil(turn))
      }, speed * 2)
      setIsAllowedToPlay(false);
    }
  }
}, [pulses])

useEffect(() => {
  if (!isGameOn) {
    setSequence([]);
    setCurrentGame([]);
    setIsAllowedToPlay(false);
    setSpeed(initSpeed);
    setBackgroundImage(outside);
    setSuccess(0);
    setPulses(0);
    setTurn(0);
  }
}, [isGameOn])

useEffect(() => {
  if (success === sequence.length && success > 0) {
    if (success % 5 === 0) {
      const newSpeed = (speed - speedIncrease) < minSpeed ? minSpeed : (speed - speedIncrease)
      setDifficulty(difficulty+1)
      setSpeed(newSpeed)
    }
    setTimeout(() => {
      setSuccess(0);
      setPulses(0);
      setCurrentGame([]);
      randomNumber();
    }, 500);
  }
}, [success])

useEffect(() => {
  if (!isAllowedToPlay) {
    sequence.map ((item, index) =>{
      setTimeout(() => {
        play({id: colors[item].sound})
        setBackgroundImage(colors[item].img);
        setTimeout(() => {
          setBackgroundImage(tavern);
        }, speed / 2)
      }, speed * index)
    })
  }
  setIsAllowedToPlay(true);
}, [sequence])

const preloadImages = () => {

  const totalImages = imageUrls.length;
  let loadedImages = 0;

  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      loadedImages += 1;
      if (loadedImages === totalImages) {
        setImagesLoaded(true);
      }
    };
    img.onerror = () => {
      console.error(`Error loading image: ${url}`);
    };
  });
};

const initGame = () => {
  randomNumber();
  setIsGameOn(true);
}

const randomNumber = () => {
  setIsAllowedToPlay(false);
  const randomNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1) + minNumber)
  setSequence([...sequence, randomNumber]);
  setTurn(turn + 1);
}

const handleClick = (index) => {
  if (isAllowedToPlay) {
    play({id: colors[index].sound})
    setBackgroundImage(colors[index].img);
    setTimeout(()=>{
      setBackgroundImage(tavern);
      setCurrentGame([...currentGame, index]);
      setPulses(pulses+1);
    }, speed / 2);
  }
}

  return(
    <>
    <div
            className="background-container"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          >
          </div>
    {
      isGameOn
      ?
      <>
      {
        imagesLoaded
        ?
        <>
          <div className="header">
              <h1>Stats</h1>
            <div className="statsContainer">
              <li className="stats">Round: {turn}</li>
              <li className="stats">Difficulty Level: {difficulty}</li>
              <li className="stats">Max Level Reached: {record}</li>
            </div>
          </div>
          <div className="container">
            {colors.map((item, index) =>{
              return (
                <div
                key={index}
                ref={item.ref}
                className={`pad pad-${index}`}
                onClick={()=> handleClick(index)}
                >
                </div>
              )
            }) }
          </div>
        </>
        :
        <>
          <p id="imgLoader">LOADING IMAGES</p>
        </>
      }
      </>
      :
      <>
        <div className="title">
          <h1> SIMON POTIONS </h1>
          <h2> Knock the door to start the trial </h2>
        </div>
          <button onClick={initGame} className="lobby"></button>
      </>
    }
    </>
  )
}
export default App