var msgService = require("firebase-admin/messaging")
var express = require("express")
var admin = require("firebase-admin")
var serviceAccount = require("./safetystove-3ff9e-firebase-adminsdk-kwn5x-3cb2b7dc09.json");
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
  res.send({ title: 'send api' });
  const messageNotRunning = {
    notification: {
      title: "Stove is not running",
      body: 'manage your stove setup it can be more safety'
    },
    token: req.body.token,
  }
  await notifAvailable( messageNotRunning)
  // admin.database().ref('stove').on('value', (sn) => {
  //   sn.forEach(async (st) => {
  //     const data = st.val()
  //     res.send({
  //       title: `${data.fcmToken}`
  //     });
  //     notifConditioning(data.notifCondition, data.timeOff, data.fcmToken)
  //   })
  // })

});

function toStringFromInt(inp) {
  switch(inp){
    case 1:
      return "1 minutes"
      // break;
      case 5:
        return "5 minutes"
        // break;
        case 10:
          return "10 minutes"
          // break;
          case 60:
            return "1 hours"
            // break;
            default:
              return "1 min"
  }
}

async function notifConditioning(notifSwitch, timeOff, token) {
  const messageRunning = {
    notification: {
      title: "Stove is Safety",
      body: 'get close with your app'
    },
    token: token,
  };

  const messageNotRunning = {
    notification: {
      title: "Stove is not running",
      body: 'manage your stove setup it can be more safety'
    },
    token: token,
  }
  const messageTimeOff = {
    notification: {
      title: "Time Safety Completed",
      body: `${toStringFromInt(timeOff)} is completed`
    },
    token: token
  }
  const messageTimeOn = {
    notification: {
      title: "Time Safety Start",
      body: `${toStringFromInt(timeOff)} before your stove will turning off`
    },
    token: token
  }
  switch (notifSwitch) {
    case 1: // notif for running stove
      await notifAvailable(messageRunning)
      console.log(" notification 1")
      break
    case 2: // notif for off stove
      await notifAvailable(messageNotRunning)
      console.log(" notification 2")
      break
    case 3: // notif for time event start conditon
      await notifAvailable(messageTimeOn)
      console.log("notification 3")
      case 4:
        await notifAvailable(messageTimeOff);
        console.log("notification 4");
      break
    default:
      console.log("default")
  }
}


// const ref = db.ref(`stove`)
admin.database().ref('stove').on('value', (sn) => {
  sn.forEach(async (st) => {
    const data = st.val()
    notifConditioning(data.notifCondition, data.timeOff, data.fcmToken)
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


var server = app.listen(3000, function () {
  console.log(server.address())
  console.log("Notification Server Start on port 3000");
});
