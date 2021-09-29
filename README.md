[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]



<!-- PROJECT LOGO -->
<br />
<p align="center">

   <h3 align="center">TF2Pickup.org-WinrateBot</h3>

  <p align="center">
    This is a discord bot which you can run additionally to your tf2pickup.org installation to provide detailed player statistics using a simple `!winrate` command
    <br />
    <br />
    <a href="https://github.com/NetroScript/TF2Pickup.org-WinrateBot/issues">Report Bug</a>
    ·
    <a href="https://github.com/NetroScript/TF2Pickup.org-WinrateBot/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary><h2 style="display: inline-block">Table of Contents</h2></summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#setup-with-nodejs">Setup with NodeJS</a></li>
        <li><a href="#setup-with-docker">Setup with docker</a></li>
      </ul>
    </li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

![Image example for bot](https://i.imgur.com/gc7o1Kd.pnghttps://i.imgur.com/gc7o1Kd.png)

This bot hooks as additional connection into your already existing bot for your [tf2pickup.org](https://github.com/tf2pickup-org/server) instance.

It offers a single `!winrate <Arguments>` command to show exactly that. To get more info about it, you can run `!winrate help` or `!winrate ?`. Then you will be shown the following text: 

```
Please use the command the following way: !winrate <player> [<<teammate>][><enemy>][!<<not teammate>][!><not enemy>][|<days since>].
Examples:
!winrate Jack | 30 -> Show Jack's winrate in the last 30 days an
!winrate Jack < Rising < amp-t -> Show the winrate of Jack with all games where Rising and Amp-T were in his team.
!winrate Jack!<danny!>danny|30 -> Show the winrate of Jack from all games in the last 30 days, in which danny was neither in his team, nor in the opponent team
```

This help command should already explain all the features available.
Localisation is available for german and english. For more see the following chapter.

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running you can either manually set up NodeJS on your system or use the provided Dockerfile.

### Prerequisites

In both cases you will need to configure your own `.env` file. Take a look at the `example.env` file, fill in your own data and rename it to .env.

A Configuration might look like this:

```dotenv
DISCORD_BOT_TOKEN="My Nice Token"
DATABASE_URL="mongodb://winrate-reader:nice-password@localhost:8001/"
LOCALE="de"
DOMAIN="tf2pickup.de"
```

<br>

**As you can see the user here is winrate-reader**. 

This is because for the local installation of tf2pickup.de a special new user was added called winrate-reader. This user can access the tf2pickup.de database, but only has read permission and no write permission. **This is for the case that updates of the main repo change the database layout**. I suggest also creating a user with only read permissions. Should you break anything by supplying a connect string of a root user, it is your own fault.

### Setup with NodeJS

This assumes you have a recent enough version of NodeJS and NPM installed on your system.

1. Clone the repo
   ```sh
   git clone https://github.com/NetroScript/TF2Pickup.org-WinrateBot.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Then to run the application: 
   ```sh
   npm run run 
   ``` 
   or 
   ```sh
   node build/index.js
   ``` 
   
Should you want to do your own changes, do them in the `src` directory and execute

   ```sh
   npm run compile
   ``` 

once before running the application again.

### Setup with Docker

You can use the provided Dockerfile directly or just use docker-compose to make it even easier. 

1. Clone the repo
   ```sh
   git clone https://github.com/NetroScript/TF2Pickup.org-WinrateBot.git
   ```
2. Build the docker image and run it using docker-compose
   ```sh
   sudo docker-compose up
   ```
   
If you want to do any changes, you need to stop the container, build the image again with

   ```sh
   sudo docker-compose build
   ```

before you start the container again. The exception here is changes in the `.env` file.

<!-- CONTRIBUTING -->
## Contributing

Feel free to add more localisations or improve parts.
To do so:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/NetroScript/TF2Pickup.org-WinrateBot.svg?style=for-the-badge
[contributors-url]: https://github.com/NetroScript/TF2Pickup.org-WinrateBot/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/NetroScript/TF2Pickup.org-WinrateBot.svg?style=for-the-badge
[forks-url]: https://github.com/NetroScript/TF2Pickup.org-WinrateBot/network/members
[stars-shield]: https://img.shields.io/github/stars/NetroScript/TF2Pickup.org-WinrateBot.svg?style=for-the-badge
[stars-url]: https://github.com/NetroScript/TF2Pickup.org-WinrateBot/stargazers
[issues-shield]: https://img.shields.io/github/issues/NetroScript/TF2Pickup.org-WinrateBot.svg?style=for-the-badge
[issues-url]: https://github.com/NetroScript/TF2Pickup.org-WinrateBot/issues
[license-shield]: https://img.shields.io/github/license/NetroScript/TF2Pickup.org-WinrateBot.svg?style=for-the-badge
[license-url]: https://github.com/NetroScript/TF2Pickup.org-WinrateBot/blob/master/LICENSE