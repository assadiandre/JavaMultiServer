const functions = require('firebase-functions');

const admin = require('firebase-admin');


admin.initializeApp(functions.config().firebase);


exports.createPlayer = functions.https.onRequest((req, res) => {
	const UID = Math.random().toString(36).substr(2, 9);
	const promise = admin.database().ref('/Users' + "/" + UID).set( {Pairing_Status : false, Session_ID : "", Opponent_ID: "", Session_Character: ""}).then((snapshot) => {
		console.log(UID);
		res.send(UID);
		return UID;
	}).catch(error => {
		console.log(error);
		res.status(500).send(error);
	});
});

exports.pairPlayers = functions.database.ref('/Users')
    .onWrite( (change, exists)  => {

    	const original = change.before.val();
    	const current = change.after.val();
    	var changedKey = "";
    	var pairedKey = "";
    	const deleteApp = () => app.delete().catch(() => null);

    	for (var cKey in current){
    		if ( !(cKey in original) ) {
    			changedKey = cKey;
    		}
    	}

    	if ( current[changedKey]["Pairing_Status"] === false ) { // change to true
	    	for (var oKey in original){
	    		if (original[oKey]["Pairing_Status"] === false ) {
	    			pairedKey = oKey;
	    			break;
	    		}
	    	}
    	} 

    	if (pairedKey === "") {
    		// pause pairing if there are no available pairs.
    		console.log("Could not pair", changedKey);
    	}
    	else {

    		console.log(changedKey);
    		console.log(pairedKey);

    		// generate session ID
    		const sessionID = Math.random().toString(10).substr(2, 9);

    		// create those references in database
    		return Promise.all([ 
    			change.after.ref.child(changedKey).child('Pairing_Status').set(true), 
    			change.after.ref.child(pairedKey).child('Pairing_Status').set(true), 
    			change.after.ref.child(changedKey).child('Session_ID').set(sessionID),
    			change.after.ref.child(pairedKey).child('Session_ID').set(sessionID),
    			change.after.ref.child(changedKey).child('Opponent_ID').set(pairedKey),
    			change.after.ref.child(pairedKey).child('Opponent_ID').set(changedKey),
                change.after.ref.child(changedKey).child('Session_Character').set("Wolf"),
                change.after.ref.child(pairedKey).child('Session_Character').set("Bunny"),
    			admin.database().ref('/Sessions' + "/" + sessionID + "/" + changedKey).set( {character: "Wolf" , xVel: 0, yVel: 0, x: 580, y: 580} ),
    			admin.database().ref('/Sessions' + "/" + sessionID + "/" + pairedKey).set( {character: "Bunny" , xVel: 0, yVel: 0, x: 100, y: 100} )
    		]);

    	}

});
