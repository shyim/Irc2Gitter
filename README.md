Irc2Gitter is a bridge between irc servers and gitter, that allows you to communicate between irc and gitter.

# Installation
The easist way to install irc2gitter is using the npm package manager
```
npm install -g irc2gitter
```
Of course you can also clone this repo and install the dependencies with
```
npm install
```

# Requirements
- Second Gitter Accounts (needed for Notifications)
- Gitter Token (can be requsted on developer.gitter.im)
- At least nodejs v4 lts

# Features
- Automatic Posting Code to dpaste.de and replace the code with a dpaste link with the default markdown syntax
- After Answering a people with on pm channel, you can omit the name

# Basic Support
You need a config.json in our Working Directory, it should have this schema:
```json
{
  "irc.server.com": {
    "nickname": "IrcNick",
    "gitterNickname": "GitterBotName",
    "gitterToken": "TOKEN FROM developer.gitter.im",
    "channels": [
      {
        "ircChannel": "IRC-Channel",
        "gitterChannel": "Gitter-Channel"
      }
    ]
  }
}
```

and you can start the bridge with
```
irc2gitter
```
or if the repository is cloned with
```
node .
```