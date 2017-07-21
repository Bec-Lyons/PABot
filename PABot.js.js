var builder = require('botbuilder');
var restify = require('restify');
var githubClient = require('./github-client.js');

//console connector for now, just by using the console window 
//call to listen, tells it to listen to someone communicating through command window 
var connector = new builder.ConsoleConnector().listen();

//create bot, universal, will work with any connector you want i.e. console connector, chat connector (eventually connected with slack, fb etc.)
var bot = new builder.UniversalBot(connector);

//when you create a dialog, give them names and set them up much in the same way you would a path so you can go in and call them later on 
//session object knows what's currently going on and how to communicate back to the user
// bot.dialog('/', function(session) {
//     //session.send('Hello, bot!');

//     //get what user sent in and reply back with it 
//     var userMessage = session.message.text;
//     session.send('you said ' +userMessage);
// });

//WATERFALL type flow, calls the first function wait for a response, then call the second, third etc. and so on 
//simple waterfall with two functions, can have many more
// adding in an array of functions
//Root dialog
bot.dialog('/', [
    function (session) {
        //Get user info
        session.beginDialog('/ensureProfile', session.userData.profile);
    },
    function (session, results) {
        //We've gotten the user's information and can now give a response based on that data
        session.userData.profile = results.response;
        session.send('Hello %(name)s! I love %(company)s!', session.userData.profile);
    }
]);

bot.dialog('/ensureProfile', [
    function (session, args, next) {
        session.dialogData.profile = args || {};
        //Checks whether or not we already have the user's name
        if (!session.dialogData.profile.name) {
            builder.Prompts.text(session, "What's your name?");
        } else {
            next();
        }
    },
    function (session, results, next) {
        if (results.response) {
            session.dialogData.profile.name = results.response;
        }
        //Checks whether or not we already have the user's company
        if (!session.dialogData.profile.company) {
            builder.Prompts.text(session, "What company do you work for?");
        } else {
            next();
        }
    },
    function (session, results) {
        if (results.response) {
            session.dialogData.profile.company = results.response;
        }
        //We now have the user's info (name, company), so we end this dialog
        session.endDialogWithResult({ response: session.dialogData.profile });
    }
]);

// var server = restify.createServer();
// server.listen(process.env.port || process.env.PORT || 3978, function() {
//     console.log('%s listening to %s', server.name, server.url); 
// });
// server.post('/api/messages', connector.listen());