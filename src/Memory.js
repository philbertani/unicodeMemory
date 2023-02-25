import React,{useEffect,useState,useRef} from 'react';
import './flipcard.css'

//i don't feel like refactoring this code to deal with
//eslint neuroticism
//https://stackoverflow.com/questions/62036453/creating-refs-inside-a-loop
//so export ESLINT_NO_DEV_ERRORS=true to avoid
//or export DISABLE_ESLINT_PLUGIN=true for prod build

const initDisplay=Array(100).fill(1)

//just fudging ranges of characters here
const charStart = [127750,128512,128640,129292]
const range = [500,50,15,215]
const map = [0,0,0,0,1,1,2,3,3]
const rnd1 = Math.trunc(Math.random()*9)
const rnd2 = map[rnd1]

//need to move this into a useEffect that gets called when page is refreshed
const numCardsInit = 32
let arr = Array(numCardsInit).fill(0)
for (let i=0; i<=numCardsInit; i++) {
  arr[i] = i%(numCardsInit/2) + 1
}

for (let i=0; i<40; i++) {
  let p1=1+Math.trunc(Math.random()*numCardsInit)
  let p2=1+Math.trunc(Math.random()*numCardsInit)
  if (p1!==p2) {
    const tmp=arr[p1]
    arr[p1]=arr[p2]
    arr[p2]=tmp
  }
}

//console.log('array is',arr)
//console.log('sorted array',arr.sort((a,b)=>a-b))

function unicode(num) {
  //this is some weird a.. sh.t we have to do to
  //get a unicode escape sequence constructed
  //but it works

  //toString with an argument returns the string
  //representation of the number in that base
  let unicodeOut = Number(num).toString(16);
  unicodeOut = parseInt(unicodeOut,16)
  unicodeOut = String.fromCodePoint(unicodeOut)
  return unicodeOut
}

export default function  Splash(props) {

  const [doneOne,setDoneOne] = useState(false)
  const [memoryCounter,setMemoryCounter] = useState(0)
  const [counter,setCounter] = useState(0)
  const [displayToggle, setDisplayToggle] = useState(initDisplay)
  const [previous,setPrevious] = useState(-1)
  const [matches,setMatches] = useState([])
  const [numMatches,setNumMatches] = useState(0)
  const [reset,setReset] = useState(false)
  const [initialClick,setInitialClick] = useState(1)
  const [numCards,setNumCards] = useState(numCardsInit)

  const clickRef = useRef()
  
  //react now doesn't like this useRef() in a loop
  //but it works - so just disable the error
  let flipRefs = []
  for (let i=0; i<=numCards;i++) {
    const flipRef = useRef()
    flipRefs.push(flipRef)
  }
 
  useEffect(()=>{
    if (reset) {
      //console.log('resetting')
      for (let i=1; i<=numCards; i++) {
        if (displayToggle[i] === 0) {
          flipRefs[i].current.classList.remove("flip-card-inner-toggle")
        }
        else {
          flipRefs[i].current.classList.add("flip-card-inner-toggle")
        }
      }

      for (const match of matches) {
        flipRefs[match].current.style.backgroundColor = 'purple'
      }

      if (!doneOne) {
        setTimeout(()=>{ setDoneOne(true) ; if (counter===1) handleClick({},initialClick) },2000 )
      }
    }
    setReset(false)
  },[reset])

  function cheatPeek(ev) {
    for (let i=1; i<=numCards; i++) {
      setTimeout(()=>{flipRefs[i].current.classList.add("flip-card-inner-toggle")},10*i)
    }

    setTimeout(()=>{
      for (let i=numCards; i>=1; i--) {
          flipRefs[i].current.classList.remove("flip-card-inner-toggle") 
      }

      for (const match of matches) {
        flipRefs[match].current.style.backgroundColor = 'purple'
        flipRefs[match].current.classList.add("flip-card-inner-toggle")
      }
      //wow - initialClick state lags behind clickRef by one function call
      flipRefs[initialClick].current.classList.add("flip-card-inner-toggle")
      flipRefs[clickRef.current].current.classList.add("flip-card-inner-toggle")
    },4000)

  }

  const handleClick = (evt,i) => {

    //if (i==previous) return  //this messes things up if we cheat peek

    setReset(true)
    setMemoryCounter((x) => (x + 1) % 2);
    setInitialClick(i)
    setCounter(x=>x+1)

    clickRef.current = i

    let newDisplayToggle;
    if (memoryCounter === 0) {
      newDisplayToggle = [...displayToggle];
      if (arr[i] === arr[previous] && i!==previous) {
        console.log("found a match");
        matches.push(i, previous);
        setNumMatches((x) => x + 1);
      }
    } else {
      setPrevious(i);
      newDisplayToggle = Array(100).fill(0);
      for (const match of matches) {
        newDisplayToggle[match] = 1;
      }
    }
    newDisplayToggle[i] = 1;
    setDisplayToggle(newDisplayToggle);
  }

  //the backs of the cards are the extended characters starting at 
  //127760 + random(1000) which yields an amazing variety of emojis/characters/icons
  //127750-128300, 128512-128591, 128640-128685,129292-129535
  const [base,setBase] = useState(charStart[rnd2]+Math.trunc(Math.random()*range[rnd2]))

  let splashOut = [];
  for (let i = 1; i <= numCards; i++) {

    //const toggle1 = displayToggle[i]
    //const toggle2 = (displayToggle[i]+1)%2

    splashOut.push([

      <div key="flipCard" className="flip-card">
        <div
          key="flipCardInner"
          ref={flipRefs[i]}
          id={"image" + i}
          className="flip-card-inner"
          onClick={(evt) => {handleClick(evt,i)} }
          style={{ backgroundColor: "white" }}
        >
          <div
            key="flipCardBack"
            id={"image" + i}
            className="flip-card-back"
            style={{fontSize:'max(60px,6vw)'}}
          >
            {unicode(base + arr[i])}
          </div>

          <div
            key="flipCardFront"
            id={"image" + i}
            className="flip-card-front"
          >

          </div>
        </div>
      </div>,
    ]);
  }

  return ([
    <div className="gameMessages" key="playMemory">
      <div>
        <p>Refresh to get a new Set of Random Unicode Characters</p>
        num Matches {numMatches}
        <span key="cheat">,{'\u00A0'}<button key="cheatButton" onClick={(ev)=>{cheatPeek(ev)}}>Cheat Peek</button></span>
      </div>
    </div>,
    <div key="splash" className="flexBox01" id="splash">
      {splashOut}
    </div>
    ]
  );
};

