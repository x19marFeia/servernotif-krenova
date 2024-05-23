var msgService = require("firebase-admin/messaging")
var express = require("express")
var admin = require("firebase-admin")
var cors = require("cors");
var serviceAccount = require("./safetystove-3ff9e-firebase-adminsdk-kwn5x-3cb2b7dc09.json");
// const { getFirestore, Timestamp, FieldValue, Filter, initializeApp } = require('firebase-admin/firestore');
process.env.GOOGLE_APPLICATION_CREDENTIALS;

const firebaseConfig = {
  apiKey: "AIzaSyDzZuxbLVAW7bkMNPSdvlgoLhM2JvyuY88",
  authDomain: "safetystove-3ff9e.firebaseapp.com",
  databaseURL: "https://safetystove-3ff9e-default-rtdb.firebaseio.com",
  projectId: "safetystove-3ff9e",
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "safetystove-3ff9e.appspot.com",
  messagingSenderId: "11558714996",
  appId: "1:11558714996:web:38e2063d31e8a7878cdb21",
  measurementId: "G-N4YTR54HPY"
};

admin.initializeApp(firebaseConfig);
const db = admin.firestore()



const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.use(
  cors({
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

app.use(function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  next();
});

app.get('/', function (req, res) {
  res.send({ title: 'GeeksforGeeks' });
});


//non module api
app.post("/send", async function (req, res) {
  res.send({ title: req.body.token });
  const messageNotRunning = {
    notification: {
      title: "Stove is not running",
      body: 'manage your stove setup it can be more safety'
    },
    token: req.body.token,
  }
  await notifAvailable( messageNotRunning)


});

async function notifConditioning(notifSwitch, timeOff, token, guiCond, espCond, serN) {
  console.log(token)
  const messageRunning = {
    notification: {
      title: "Stove is Safety",
      body: `stove is on until timer is completed in ${timeOff}`
    },
    token: token,
  };

  

  const messageNotRunning = {
    notification: {
      title: "Stove is not running",
      body: theMessageCond(guiCond, timeOff)
    },
    token: token,
  }
  // const messageTimeOff = {
  //   notification: {
  //     title: "Time Safety Completed",
  //     body: `${toStringFromInt(timeOff)} is completed`
  //   },
  //   token: token
  // }
  // const messageTimeOn = {
  //   notification: {
  //     title: "Time Safety Start",
  //     body: `${toStringFromInt(timeOff)} before your stove will turning off`
  //   },
  //   token: token
  // }
  switch (notifSwitch) {
    case 1: // notif for running stove
    await db.collection('user').where('serialNumber', '==', serN).get().then((dz) => {
      dz.forEach(cm => {
        db.collection('user').doc(cm.id).update({
          stoveStatus: espCond
        })
        db.collection('user').doc(cm.id).collection('stoveUsage').add({
          time: admin.firestore.Timestamp.now(),
          condition: espCond
        })
      })
    })
      await notifAvailable(messageRunning)
      console.log(" notification 1")
      break
    case 2: // notif for off stove
    await db.collection('user').where('serialNumber', '==', serN).get().then((dz) => {
      dz.forEach(cm => {
        db.collection('user').doc(cm.id).update({
          stoveStatus: espCond
        })
        db.collection('user').doc(cm.id).collection('stoveUsage').add({
          time: admin.firestore.Timestamp.now(),
          condition: espCond
        })
      })
    })
      await notifAvailable(messageNotRunning)
      console.log(" notification 2")
      break
    default:
      console.log("default")
  }
}


// const ref = db.ref(`stove`)
admin.database().ref('stove').on('value', async (sn) => {
  sn.forEach(async (st) => {
    const data = st.val()
    if(!data.isRunningEsp){
      admin.database().ref('stove').child(data.serialNumber).update({
        isRunningGUI: false
      })
    }
    // if(data.notifCondition == 1 || data.notifCondition == 2){
    //   await db.collection('user').where('serialNumber', '==', data.serialNumber).get().then((dz) => {
    //     dz.forEach(cm => {
    //       db.collection('user').doc(cm.id).update({
    //         stoveStatus: data.isRunningEsp
    //       })
    //       db.collection('user').doc(cm.id).collection('stoveUsage').add({
    //         time: admin.firestore.Timestamp.now(),
    //         condition: data.isRunningEsp
    //       })
    //     })
    //   })
    // }
    notifConditioning(data.notifCondition, data.timeOff, data.fcmToken, data.isRunningGUI, data.isRunningEsp, data.serialNumber)
  })
})


async function notifAvailable(theMsg) {
  await msgService.getMessaging().send(theMsg)
    .then((response) => {
      console.log(response)
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
}

function theMessageCond (cond, time){
  if(cond){
    return "your stove is turning off"
  }else{
    return `your timer was completed in ${time}`;
  }
}


var server = app.listen(3000, function () {
  console.log(server.address())
  console.log("Notification Server Start on port 3000");
});
