const functions = require("firebase-functions");

const admin = require('firebase-admin');

admin.initializeApp();

//* get tokens from messaging client. Check here and store in firestore
exports.processMessagingToken = functions
    .region('australia-southeast1')
    .https
    .onCall(async (data, context) => {
        try {

            if (!data.userID || data.userID !== context.auth.uid) {
                throw Error("Authenticated user credentials must provided")
            }

            if (!data.token) {
                throw Error("A token to process must be provided")
            }

            const token = data.token;

            const userMetaRef = admin.firestore().collection("users_meta").doc(context.auth.uid);

            return admin.firestore()
                .runTransaction(async transaction => {
                    await transaction.get(userMetaRef).then(async(res) => {

                        const currentTokens = res.data()?.tokens;

                        if (!currentTokens) {
                            await transaction.set(userMetaRef, {
                                tokens: admin.firestore.FieldValue.arrayUnion(token),
                            }, {
                                merge: true
                            })
                            return {
                                success: true,
                                message: "Created and stored a new device token in user's token collection",
                            };
                        }
                        else {

                            if (!currentTokens.includes(token)) {
                                await transaction.set(userMetaRef, {
                                    tokens: admin.firestore.FieldValue.arrayUnion(token),
                                }, {
                                    merge: true
                                }
                                );
                                return {
                                    success: true,
                                    message: "Added a new token in user's token collection",
                                };
                            }
                            else {
                                return {
                                    success: true,
                                    message: "Device Tokens already exists in user's token collection",
                                };
                            }
                        }
                    });
                })

        } catch (error) {
            return { message: "Error while running token check" + error, success: false };
        }
    });


//* use admin messaging api to send message to a user's device.
//* data required: reciever's user id, call session id, name of accepter.
exports.notifyUserTopicCallAccept = functions
    .region('australia-southeast1')
    .https
    .onCall(async (data, context) => {
        try {

            const callerUID = context?.auth?.uid;
            if(!callerUID){
                throw Error("Only authorised users can access the resource")
            }

            const receiverID = data.receiverID
            const callSessionID = data.callSessionID

            const topicID = data.topicID;

            if (!receiverID) {
                throw Error("A receiver must be specified")
            }
            if (!callSessionID) {
                throw Error("A call session ID must be specified")
            }

            if (!topicID) {
                throw Error("A topic ID must be specified")
            }

            if (!context.auth.uid) {
                throw Error("Only authenticated users can perform this action");
            }

            const userMetaRef = await admin.firestore().collection("users_meta").doc(receiverID).get();

            let userTokenArray = [];

            if (userMetaRef.data().tokens) {
                userTokenArray = userMetaRef.data().tokens;
            }

            await admin.messaging().sendMulticast({
                tokens: userTokenArray,
                data: {
                    callSessionID: callSessionID,
                    callerUID,
                    callerName: data.notifierName,
                    topicID
                },
                notification: {
                    title: `${data.notifierName} has accepted you call`,
                    body: "Tap to start your conversation now",
                },
            });

            return {message: 'User has been notified of this call session', success: true};


        } catch (error) {
            return { message: "Error while notifying user of your accepted call request" + error, success: false };
        }
    })