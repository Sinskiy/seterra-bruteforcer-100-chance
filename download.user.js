// ==UserScript==
// @name         Seterra bruteforce 100% chance
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Extension for Seterra to train bruteforce. You don't have to try until the right path falls out. Just click
// @author       Sinskiy
// @match        *://*.geoguessr.com/seterra/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==


// const & let

const gmSelector = document.getElementById("drpGameMode");
const countries = document.querySelectorAll("g");
const amountOfCountries = Array.from(countries).filter((country) =>
  country.classList.contains("q")
).length;
const completion = document.getElementById("completion");
const score = document.getElementById("lblFinalScore2");
const timer = document.getElementById("timer");
const button = document.getElementById("cmdRestart");
const divTips = document.getElementById("divTips");
let time = 0;
let finished = false;
let amountOfClicked = 0;
let timerCount;

// creating timer

function startTime() {
  timerCount = setInterval(setTime, 100);
}

timer.setAttribute("id", "overrideTimer");

function timerTime(ms) {
  const pad = function (x) {
    return x < 10 ? "0" + x : x;
  };
  const hours = pad(parseInt(Math.floor(ms / 36000)));
  let remainder = ms % 36000;
  const minutes = pad(parseInt(Math.floor(remainder / 600)));
  remainder = remainder % 600;
  const seconds = pad(parseInt(Math.floor(remainder / 10)));
  remainder = parseInt(remainder % 10);
  return `${hours > 0 ? `${hours}h ` : ""}${
    minutes > 0 ? `${minutes}m ` : ""
  }${seconds}s ${remainder}00ms`;
}

function setTime() {
  time++;
  document.getElementById("overrideTimer").innerHTML = timerTime(time);
}

// creating new gamemode

const option = document.createElement("option");
option.innerHTML = "Cheating";
option.setAttribute("value", "cheating");

// adding new gamemode

gmSelector.appendChild(option);

// main functionality

function gmCheating() {
  if (gmSelector.value === "cheating") {
    startTime();
    countries.forEach((country) => {
      country.addEventListener("mousedown", whenCountryClicked);
    });
    document.getElementById("questionFlag").style.display = "none";
    document.getElementById("score").style.display = "none";
    divTips.innerHTML = "Click shift + e to restart (alt + r conflicts)";
    divTips.style.color = "green";
  } else {
    return;
  }
}

function whenCountryClicked(e) {
  const clickedCountry = e.target.parentElement;
  clickedCountry.classList.contains("answered") ? "" : amountOfClicked++;
  if (amountOfClicked === amountOfCountries && finished === false) {
    showFinalScreen(clickedCountry);
  } else paint(clickedCountry);
}

function paint(country) {
  const landArray = Array.from(country.children);
  landArray.forEach((land) => {
    if (land.classList.contains("landarea")) {
      land.setAttribute("fill", "#f3f3f3");
      country.classList.add("answered");
    }
  });
}

const finalTime = () => {
  const pad = function (x) {
    return x < 10 ? "0" + x : x;
  };
  const hours = pad(parseInt(Math.floor(time / 36000)));
  time > 3600 ? (time = time % 36000) : time;
  const minutes = pad(parseInt(Math.floor(time / 600)));
  time > 600 ? (time = time % 600) : time;
  const seconds = pad(parseInt(Math.floor(time / 10)));
  time = parseInt(time % 10);
  return `${hours > 0 ? `${hours}h ` : ""}${
    minutes > 0 ? `${minutes}m ` : ""
  }${seconds}s ${time}00ms`;
};

function restartButton() {
  time = -1;
  clearInterval(timerCount);
  countries.forEach((country) => {
    country.classList.remove("answered");
    const landArray = Array.from(country.children);
    landArray.forEach((land) => {
      if (land.classList.contains("landarea")) {
        land.setAttribute("fill", "#1e8346");
      }
    });
  });
  finished = false;
  amountOfClicked = 0;
  completion.style.display = "none";
  gmCheating();
}

function restartKeyboard(e) {
  if (e.shiftKey) {
    if (e.code === "KeyE") {
      restartButton();
    }
  }
}

function showFinalScreen(country) {
  finished = true;
  paint(country);

  completion.style.display = "block";
  score.setAttribute("title", "Information is on the screen");

  score.innerHTML = finalTime();

  timer.setAttribute("id", "overrideTimer");
  document.getElementById("overrideTimer").innerHTML = score.innerHTML;

  clearInterval(timerCount);
}

gmSelector.addEventListener("change", gmCheating);
button.addEventListener("click", restartButton);
document.addEventListener("keydown", restartKeyboard);
