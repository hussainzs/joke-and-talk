/* 
Speech  Synthesis API is a part of the Web Speech API, that enables the web apps to convert text to speech in a standard way across browsers and platforms.
Every browser has its own implementation of the API, which is based on the operating system’s speech synthesis capabilities.
**NOTES about ASYNC for web speech API**
--> Web Speech API fires an event called onvoiceschanged when the list of SpeechSynthesisVoice objects that would be returned by the SpeechSynthesis.getVoices() method has changed.
--> When this event is fired, you can call populateVoiceList() to update the list of available voices.
--> when using .getVoices() method, we must wait for the voiceschanged event to fire before calling it.
*/

const synth = window.speechSynthesis;

const inputText = document.querySelector("#text");
const voiceSelect = document.querySelector("#voice-select");
const submitButton = document.querySelector("#ttsBtn");
const jokeBtn = document.querySelector("#jokeBtn");
const bars = document.getElementById("bars");
// Voices array with all available voices
let voices = [];

// Get all voices available
const populateVoiceList = () => {
  // when using .getVoices() method, we must wait for the onvoiceschanged event to fire before calling it since .getVoices() is an asynchronous operation.
  voices = synth.getVoices();

  fillDOmWithVoices();
};

// Fill DOM with voices
const fillDOmWithVoices = () => {
  voices.forEach((voice) => {
    const option = document.createElement("option");
    // Remove the voice provider name from the voice name to make it easier to read using regex
    const voiceName = voice.name.replace(
      /^(?:Google|Microsoft|Apple|Amazon)\s/,
      ""
    );
    option.textContent = `${voiceName} (${voice.lang})`;
    // these option attributes help in selecting the voice from the dropdown
    option.setAttribute("data-lang", voice.lang);
    option.setAttribute("data-name", voice.name);
    voiceSelect.appendChild(option);
  });
};

// Speak function
const speak = () => {
  const older = submitButton.innerHTML;
  // check if speaking is true, if it is, stop speaking
  if (!synth.speaking) {
    // show bars
    showBars();

    // change the button text to indicate that the text is being spoken
    submitButton.innerHTML = `Speaking <i class="fas fa-volume-up fa-beat"></i>`;

    // create a new SpeechSynthesisUtterance object instance and set the text property of the object to the value of the text input field.
    const utterText = new SpeechSynthesisUtterance(inputText.value);
    // get the selected voice name the dropdown using one of the option attributes we set earlier i.e. data-name
    const selectedVoice =
      voiceSelect.selectedOptions[0].getAttribute("data-name");
    // loop through the voices array and set the voice property of the utterance object to the voice that matches the selected voice name.
    utterText.voice = voices.find((voice) => voice.name === selectedVoice);

    synth.speak(utterText);

    // when the speech is finished, change the button text back to the original text
    utterText.onend = () => {
      submitButton.innerHTML = older;
      bars.hidden = true;
    };
  }
};

// show bars when speaking
const showBars = () => {
  bars.hidden = false;
  for (let i = 0; i < 90; i++) {
    const left = i * 2 + 1;
    const anim = Math.floor(Math.random() * 80 + 400);
    const height = Math.floor(Math.random() * 5 + 3);
    console.log(height);

    bars.innerHTML += `<div class="bar" style="left:${left}px;animation-duration:${anim}ms;height:${height}px"></div>`;
  }
};

/**
 * Using Joke API to fetch a joke and speak it
 */
const jokeTeller = async () => {
  if (!synth.speaking) {
    try {
      // fetch a joke from the joke API
      const apiUrl =
        "https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,racist,sexist,explicit";
      const response = await fetch(apiUrl);
      const JokeData = await response.json();
      let joke = "";

      // check if the joke is a single joke or a two part joke
      if (JokeData.type === "single") {
        joke = JokeData.joke;
      } else {
        joke = `${JokeData.setup} ... ${JokeData.delivery}`;
      }

      // fill the text area with the joke and speak it
      fillTextArea(joke);
    } catch (err) {
      alert("Error in fetching from Joke API", err);
    }
  }
};

// Fill the text area with the joke
const fillTextArea = (joke) => {
  inputText.value = joke;
  speak();
};

// Event Listeners
submitButton.addEventListener("click", speak);
jokeBtn.addEventListener("click", jokeTeller);

/**
 * Run when page loads
 */
function runner() {
  // *******************************STEP 1: Get all voices available and fill the DOM with voice options***
  //by calling populateVoiceList() initially, we can populate the voice list with any voices that are already available,
  //then wait for the onvoiceschanged event to update the voice list again if necessary.
  populateVoiceList();
  if (synth.onvoiceschanged !== undefined) {
    // add the function populateVoiceList as a callback to the onvoiceschanged event
    //(i.e. when the voiceschanged event is fired, the populateVoiceList() function will be called)
    synth.addEventListener("voiceschanged", populateVoiceList);
    // synth.onvoiceschanged = populateVoiceList; is equivalent to code above
  }
}

// Run when page loads
runner();
