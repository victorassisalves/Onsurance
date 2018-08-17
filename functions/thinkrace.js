const functions = require('firebase-functions');
const admin = require('firebase-admin')
const unirest = require("unirest");
const axios = require('axios');

  
const homolog = {
    apiKey: "AIzaSyABa9PXOgiVggDHjt1MD9bMVux-4UpObt4",
    authDomain: "onsurance-homologacao.firebaseapp.com",
    databaseURL: "https://onsurance-homologacao.firebaseio.com",
    projectId: "onsurance-homologacao",
    storageBucket: "onsurance-homologacao.appspot.com",
    messagingSenderId: "451230477262"
  }

const product = {
    apiKey: "AIzaSyD8RCBaeju-ieUb9Ya0rUSJg9OGtSlPPXM",
    authDomain: "onsuranceme-co.firebaseapp.com",
    databaseURL: "https://onsuranceme-co.firebaseio.com",
    projectId: "onsuranceme-co",
    storageBucket: "onsuranceme-co.appspot.com",
    messagingSenderId: "241481831218"
}
admin.initializeApp(homolog);


exports.carStatus = functions.https.onRequest((request, response) =>{
    console.log(`${JSON.stringify(request.query)}`);
    console.log(`${JSON.stringify(request.body)}`);
    console.log(`${JSON.stringify(request)}`);

  
})