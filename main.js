const needle = require('needle');
const twit = require('twit');
const ApiKey ="Gu3GF7h7tEi02E5IHs3IqV7ER";
const ApiSecret = "MEoLw5lyaAIrMoPVvQZL4UiUnflI3D0UM4dYRYCRHpSY0y2f6m";
const AccessToken = "1520461661177618434-RE5pRaCHmmuueCQsB8azXQV8BMDHZY";
const AccessSecret = "B1f6nCMn37yblhB1IF1DmCV8eHsHDXJGcJ4dUeyFCqvAa";
const BareToken = "AAAAAAAAAAAAAAAAAAAAACuMggEAAAAANsvH4uEqYskbRV4f2oPH2yAO7Z8%3DN9YkExwWomfnwxoQVFkSf3QLrrCrhe8jAO19mKBnq1jN5EO572";
const keyword=["intaneti","tcra","nape nnauye"];
/* 
  nntcptz, sokomoko360@gmail.com
  BOT NAME: nntcptz
  password:#Ushindi@1234 
*/

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL ='https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id,in_reply_to_user_id,referenced_tweets.id';

// Get stream rules
async function getRules() {
  const response = await needle('get', rulesURL, { headers: {Authorization: `Bearer ${BareToken}`,},})
  return response.body;
}

// Set stream rules
async function setRules() {
  const data = { add: [{value: "intaneti" },{value: "tcra" },{value: "nape nnauye"}],}
  const response = await needle('post', rulesURL, data, { headers: {'content-type': 'application/json', Authorization: `Bearer ${BareToken}`,},});
  return response.body;
}

//retweet the content
var retweet=(tweet_id)=>{
  let T = new twit({consumer_key:ApiKey,consumer_secret:ApiSecret,access_token:AccessToken,access_token_secret:AccessSecret});
  T.post('statuses/retweet/:id', { id: tweet_id }, function(error, data, response){ if(error){console.log(`Error from retweet ${error}`, data, response);} });
}

// Delete stream rules
async function deleteRules(previusrule) {
  if (!Array.isArray(previusrule.data)) {return null}
  const ids = previusrule.data.map((rule) => rule.id);
  const data = {delete: {ids: ids,},}
  const response = await needle('post', rulesURL, data, {headers: {'content-type': 'application/json',Authorization: `Bearer ${BareToken}`,},});
  return response.body
}

function streamTweets() {
    const stream = needle.get(streamURL, {headers: {Authorization: `Bearer ${BareToken}`,},})
    stream.on('data', (data) => {
        try {
            if(data){
                const json = JSON.parse(data);
                console.log(json);
                let isRt= json.data.text.substring(0,2).toString()=="RT";
                let isReply= "in_reply_to_user_id" in json.data;
                //retweet only tweets, not replies or retweets
                if(!isReply && !isRt){
                    for(let i =0; i<keyword.length; i++){
                        //check if the string contain keyword match in our array 
                        if(json.data.text.toLowerCase().includes(keyword[i].toLowerCase())){retweet(json.data.id);}
                    }
                }
            }
        } 
        catch (error){console.log(`Error from streaming, function ${error}`);}
    });
    return stream;
}


var initialize_rules= async ()=>{
    let currentRules;
    try {
        //Get all stream rules
        currentRules = await getRules();
        // Delete all stream rules
        await deleteRules(currentRules);
        // Set rules based on array above
        await setRules();
        //then call the stream function
        streamTweets();
    } 
    catch(error){console.log(`Error from initialization ${error}`);}
}

//run the function
initialize_rules();

