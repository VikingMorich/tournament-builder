// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBlSoGBEHMeY3qtCRotOS6LWTXylJZ4qMw",
    authDomain: "tournament-e57c8.firebaseapp.com",
    databaseURL: "https://tournament-e57c8-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tournament-e57c8",
    storageBucket: "tournament-e57c8.firebasestorage.app",
    messagingSenderId: "459710132722",
    appId: "1:459710132722:web:acc3cf15d586459a22bb6b",
    measurementId: "G-SNSKPGW63D"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);