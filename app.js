var tmi = require('tmi.js')

var fs = require("fs");
var text = fs.readFileSync("./emotelist.txt") + '';
var textByLine = text.split("\n");
var emote_dictionary = {}
var client_name = ""    //place channel name

function Check_Space(message){
	var valid = true
	var temp = ""
	for (var i = 0; i < message.length; i++){ //Parser for emote-code
		if (message[i] === " "){
			if(i === (message.length - 1)){
				message = message.slice(0,(message.length -1))
				if(emote_dictionary[message]){
					return [valid,message]
				}else{
					return [false,""]
				}
			}
			valid = false
			return [valid,""]
			break;
		}
	}
	if(emote_dictionary[message]){
		return [valid,message]
	}
	return [false,""]
}

function To_Dictionary(emotelist){
// 	var temp = emotelist.map(x => {
// 		var name = {}
// 		name[x] = x
// 		return name
// 	})
// 	return temp
// }
	for (var i = 0; i < emotelist.length; i++){
		emote_dictionary[emotelist[i]] = i
	}
	return emote_dictionary
}
function Emote_Parser(emote,message){
	var emote_string = ""
	var valid = true
	for (var i = 0; i < message.length; i++){ //Parser for emote-code
		if (message[i] === " "){
			valid = false
			return [valid,""]
			break;
		}
	}
	for (var i = 0; i < emote.length; i++){ //Parser for emote-code
		if (emote[i] != ":"){
			emote_string += emote[i];
		}
		else {

			break;
		}
	}
	return [valid,emote_string]

}

function Combo_Check(combo,message){
	if(combo > 1){
    		var m = combo +"x " + message + " COMBO!"
    		client.action(client_name,m)
    	}
    	combo = 0
}

var options = {
	options: {
		debug: true
	},
	connection: {
		cluster: "aws",
		reconnect: true
	},
	identity: {
		username: "Emoti",
		password: ""  //auth key
	},
	channels: ['#'+client_name]
};

var client = new tmi.client(options);
client.connect();

client.on('connected', function(address,port){
	console.log("[Emoti]Bot was started!")
	emote_dictionary = To_Dictionary(textByLine)
});

client.on('connected',function(address,port) {

	client.say(client_name,"Hello! I have joined")
});

var combo = 0
var emote_code = ""
var old_emote = ""
client.on("chat", function (channel, user, message, self) {
    // Don't listen to my own messages..
    if (self) return;
    console.log("this is the emote",message)
    var BTTV_Check = Check_Space(message)

    if(user.emotes || BTTV_Check[0]){
    	var emote_string =[false,""]
    	if(user.emotes){
    		emote_string = Emote_Parser(user['emotes-raw'],message)
    	}
    	//function to check in dictionary
    	if (emote_string[0] || BTTV_Check[0]){
    		if (emote_string[1] != emote_code){

    			Combo_Check(combo,old_emote)
    			combo = 1
    			old_emote = message
    			emote_code = emote_string[1]
    		} else {
    			combo += 1
    		}

    	}
    }else if(combo){
    	Combo_Check(combo,old_emote)
    	combo = 0
    }
    // Do your stuff.
});
