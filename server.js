const pop3client = require("mailpop3");
const { simpleParser } = require('mailparser');

const HOST = 'your-server-host';
const PORT = 995;
const USERNAME = 'your-email-address';
const PASSWORD = 'your-password';

const client = new pop3client(PORT, HOST, {
    tlserrs: false,
    enabletls: true,
    debug: false,
    rejectUnauthorized: false
});

client.on('error', function (err) {
    if (err.errno === 111) console.log('Unable to connect to server');
    else console.log('Server error occurred');

    console.log(err);
});

client.on('connect', function() {
    console.log('CONNECT success');
    client.login(USERNAME, PASSWORD);
});

client.on('invalid-state', function(cmd) {
    console.log('Invalid state. You tried calling ' + cmd);
});

client.on('locked', function(cmd) {
    console.log('Current command has not finished yet. You tried calling ' + cmd);
});

client.on('login', function(status, rawdata) {
    if (status) {
        console.log('LOGIN/PASS success');
        client.list();
    } else {
        console.log('LOGIN/PASS failed');
        client.quit();
    }
});

client.on('list', function(status, msgcount, msgnumber, data, rawdata) {
    if (status === false) {
        console.log('LIST failed');
        client.quit();
    } else {
        console.log('LIST success with ' + msgcount + ' element(s)');
        if (msgcount > 0) client.retr(msgcount);
        else client.quit();
    }
});

client.on('retr',async function(status, msgnumber, data, rawdata) {
    if (status === true) {
        console.log('RETR success for msgnumber ' + msgnumber);
        // client.dele(msgnumber);
        const parsedEmail = await simpleParser(data);
        console.log('Subject:', parsedEmail.subject);
        console.log('From:', parsedEmail.from.value.map((from) => from.address).join(', '));
        // console.log('To:', parsedEmail.to.value.map((to) => to.address).join(', '));
        // console.log('Date:', parsedEmail.date);
        console.log('Text body:', parsedEmail.text);
        // console.log('HTML body:', parsedEmail.html);
        client.quit();
    } else {
        console.log('RETR failed for msgnumber ' + msgnumber);
        client.quit();
    }
});

client.on('dele', function(status, msgnumber, data, rawdata) {
    if (status === true) {
        console.log('DELE success for msgnumber ' + msgnumber);
        client.quit();
    } else {
        console.log('DELE failed for msgnumber ' + msgnumber);
        client.quit();
    }
});

client.on('quit', function(status, rawdata) {
    if (status === true) console.log('QUIT success');
    else console.log('QUIT failed');
});
