const twilio = require("twilio");

class twiliocls {
  //phoneNumber = "+15109013581";
  phoneNumberSid = "PNfb596102227457df18ab7e9c412d340c";
  tokenSid = "SKffa431632d6542670e83574c59b3c11e";
  tokenSecret = "gDn5nRFXZY1MOquy1902UCj47B5R45PX";
  accountSid = "ACa7006f2ee45e087722928914867f0545";
  verify = "VA2943f86ce186c2bf53a47a0c6c4f144a";
  outgoingApplicationSid = "APcbec71d4833edb4239a051dbc883961e";
  serverUrl = "http://3.137.208.204:4000";

  clientobj;
  constructor() {
    this.clientobj = twilio(this.tokenSid, this.tokenSecret, {
      accountSid: this.accountSid,
    });
  }

  getClientObj() {
    this.clientobj;
  }

  async sendVerify(to, channel) {
    try {
      console.log(to);
      console.log(channel);
      await this.clientobj.verify
        .services(this.verify)
        .verifications.create({ to: to, channel })
        .then((verification) => console.log(verification.sid));
    } catch (err) {
      console.log(err);
    }
  }

  async sendVerifyCheck(to, code) {
    try {
      console.log(to);
      console.log(code);
      let result = await this.clientobj.verify
        .services(this.verify)
        .verificationChecks.create({
          // verificationSid: "VE05d4db4c8f31ed51754e9a62dc409b02",
          to,
          code,
        })
        .then((verification) => {
          console.log(
            "twilio.js sendverifycheck with infuction" + verification.sid
          );
          return verification.sid;
        });
      console.log("twilio.js sendverifycheck return result" + result);
      return result;
    } catch (err) {
      console.log(err);
    }
  }

  voiceResponse(message) {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();
    twiml.say(message);
    twiml.redirect(this.serverUrl + "/enque");

    // const VoiceResponse2 = twilio.twiml.VoiceResponse;
    // const twiml2 = new VoiceResponse2();
    // twiml2.enqueue("support");

    return twiml;
  }

  enqueCall(message) {
    const VoiceResponse = twilio.twiml.VoiceResponse;

    const twiml = new VoiceResponse();
    twiml.enqueue("support");
    return twiml;
  }

  getAccessTokenforVoice = (identity) => {
    console.log("access token for identity");
    console.log(identity);
    // const Accesstoken = twilio.jwt.AccessToken;
    // const VoiceGrant = Accesstoken.voiceGrant;
    // const outgoingAppSid = this.outgoingApplicationSid;
    // const voiceGrant = new VoiceGrant({
    //   outgoingApplicationSid: outgoingAppSid,
    //   incomingAllow: true,
    // });
    // const token = new Accesstoken(
    //   this.accountSid,
    //   this.tokenSid,
    //   this.tokenSecret,
    //   {
    //     identity,
    //   }
    // );

    // token.addGrant(voiceGrant);
    // console.log("token granted for user");
    // console.log(token.toJwt());
    // return token.toJwt();

    const AccessToken = require("twilio").jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    // Used when generating any kind of tokens
    const twilioAccountSid = "ACa7006f2ee45e087722928914867f0545";
    const twilioApiKey = "SKffa431632d6542670e83574c59b3c11e";
    const twilioApiSecret = "gDn5nRFXZY1MOquy1902UCj47B5R45PX";

    // Used specifically for creating Voice tokens
    const outgoingApplicationSid = "APcbec71d4833edb4239a051dbc883961e";
    // const identity = "user";

    // Create a "grant" which enables a client to use Voice as a given user
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: outgoingApplicationSid,
      incomingAllow: true, // Optional: add to allow incoming calls
    });

    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    const token = new AccessToken(
      twilioAccountSid,
      twilioApiKey,
      twilioApiSecret,
      { identity: identity }
    );
    token.addGrant(voiceGrant);
    console.log(token);
    return token.toJwt();
  };

  answerCall = (sid, client) => {
    this.clientobj.calls(sid).update({
      url: this.serverUrl + "/connectcall?client=" + client + "&callsid=" + sid,
      method: "POST",
      function(err, call) {
        console.log(call);
      },
    });
  };

  redirectCall = (client) => {
    const VoiceResponse = twilio.twiml.VoiceResponse;

    const twiml = new VoiceResponse();
    twiml.dial().client(client);
    return twiml;
  };

  ///reject call

  rejectCall = (sid, client) => {
    this.clientobj.calls(sid).update({
      //  url: this.serverUrl + "/connectcall",
      url: this.serverUrl + "/connectcall?client=" + client + "&callsid=" + sid,
      method: "POST",
      function(err, call) {
        console.log(call);
      },
    });
  };

  // disconnect all
  disconnectCall = (sid, client) => {
    this.clientobj.calls(sid).update({
      url:
        this.serverUrl + "/disconnectcall?client=" + client + "&callsid=" + sid,
      method: "POST",
      function(err, call) {
        console.log(call);
      },
    });
  };

  // disconnect all
  disconnectOwnCall = (sid, client) => {
    this.clientobj.calls(sid).update({
      url:
        this.serverUrl +
        "/disconnectOwnCall?client=" +
        client +
        "&callsid=" +
        sid,
      method: "POST",
      function(err, call) {
        console.log(call);
      },
    });
  };

  // disconnect all
  disconnectCallMessage = (sid) => {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();
    twiml.say("disconnecting");
    return twiml;
  };

  //dial call
  dialCall = (phoneno, client) => {
    this.clientobj.calls
      .create({
        // url: "http://demo.twilio.com/docs/voice.xml",
        url: this.serverUrl + "/dialcallpost?client=" + client,
        to: phoneno,
        from: "+15202317167",
      })
      .then((call) => {
        console.log(call.sid);
        this.clientobj.calls(call.sid).update({
          url:
            this.serverUrl +
            "/dialcallpostemit?client=" +
            client +
            "&callsid=" +
            sid,
          method: "POST",
          function(err, call) {
            console.log(call);
          },
        });
      });
  };
}
const instance = new twiliocls();
module.exports = instance;
