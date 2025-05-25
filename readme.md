# RetroDeno
Manage retro games and emulators. Done in Deno (a more modern replacement for NodeJS) and HTML/JS/CSS and using Github code pilot/Gemini Code Assist. An experiment more than anything . It's been an afternoon's work. Happy to let other people get involved if they wish. 

Microsoft's Visual Studio Github Copilot is free/open source now - and it's an amazing experience. Sadly Microsoft put a 50 chat per month limit on it unless you pay for copilot pro. So I've switched to Gemini Code Assist - which is also impressive, but as yet lacks "agent" mode

There is some test data in there including a scan of a c64 rom folder in games.json. You can use the edit icon to fill out the data for each one. It will also pull data from igdb and TheGamesDB, but you need to get a token and store it in a .env file. As test it will also query GitHub Models GPT4.1 model to get a description.

example .env file

GITHUB_PAT_TOKEN=""

TWITCH_CLIENT_ID=""

TWITCH_SECRET=""

THEGAMESDB_API_KEY=""

Stuff like EmulationStation is great, but it's written in C++ and very complex. I wanted to see if it was possible to knock something up in Deno that was simple to maintain.


