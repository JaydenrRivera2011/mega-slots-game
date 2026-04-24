// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBodXKZHgPBSrGPTzGNy2Idrnw34CqYQSY",
  authDomain: "mega-slots-game.firebaseapp.com",
  databaseURL: "https://mega-slots-game-default-rtdb.firebaseio.com",
  projectId: "mega-slots-game",
  storageBucket: "mega-slots-game.firebasestorage.app",
  messagingSenderId: "644763846920",
  appId: "1:644763846920:web:69558de60c88eb443f04bd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get references
const auth = firebase.auth();
const db = firebase.database();
