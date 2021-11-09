# klarna-subscription-checkout

## What is it?

Subscription-based Klarna Payments Checkout.

### Frameworks required to run this project:

-   [Git](https://git-scm.com/)
-   [NodeJS](https://nodejs.org/en/)

#### Installation guides

-   [Git installation](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
-   [NodeJS installation](https://nodejs.org/en/download/)

### Core NPM Modules:

-   [Express](https://expressjs.com/)
-   [Express Handlebars](https://www.npmjs.com/package/express-handlebars)

## How to install

1. Clone the git repo in the terminal using `git clone https://github.com/MMR-Solutions-AB/klarna-checkout.git`.
2. Run `cd klarna-subscription-checkout` in the terminal.
3. Run `npm i` in the terminal.
4. Ask for a supplied .env file from @devmattb. Put .env file in the root of the project.
5. Ask for a Playground Klarna Account from @devmattb
6. Run `sudo npm install -g nodemon` in the terminal.
7. Run `npm run dev` in the terminal.
8. The application should now be running on `http://localhost:<PORT_IN_ENV_FILE>`

## App Architecture

OBS: .env file is needed to run project, and is not supplied through the `git clone` command.

```
.env                # Environment variables, supplied by @devmattb.
.app.yaml           # Google Cloud deploy container settings.
public              # All static and public assets, such as images and videos.
src
│   start.js        # App start file
│   app.js          # App entry point
└───api             # Express route controllers for all the endpoints of the app
└───config          # Configuration for environment variables
└───loaders         # Splits up the startup process into modules
└───models          # Database models
└───services        # All the business logic is here
```

**Keep in mind that we often group files in to the following categories:**

```
any_folder
└───both          # Both client and server-needed files
└───client        # Only client-side needed files
└───server        # Only server-side files
```
