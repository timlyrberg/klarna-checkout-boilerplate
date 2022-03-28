# klarna-checkout-boilerplate

## How to install

1. Clone the git repo in the terminal using `git clone https://github.com/MMR-Solutions-AB/klarna-checkout-boilerplate.git`.
2. Run `cd klarna-checkout-boilerplate` in the terminal.
3. Run `npm i` in the terminal.
4. Create a Klarna Playground Account + Klarna Playground API Key that you will use below:
5. Create an .env file that looks like this: 
```
NODE_ENV=development
PORT=3000
DEV_ROOT_URL=http://localhost:3000
PROD_ROOT_URL=
# Klarna
DEV_KLARNA_BASE_URL=api.playground.klarna.com
PROD_KLARNA_BASE_URL=api.klarna.com
DEV_KLARNA_PUBLIC_KEY=**************
PROD_KLARNA_PUBLIC_KEY=
DEV_KLARNA_SECRET_KEY=**************
PROD_KLARNA_SECRET_KEY=
# Klarna Checkout
KLARNA_MERCHANT_TERMS_URL=http://localhost:3000/terms
KLARNA_MERCHANT_CHECKOUT_URL=http://localhost:3000
KLARNA_PURCHASE_COUNTRY=SE
KLARNA_PURCHASE_CURRENCY=SEK
KLARNA_LOCALE=sv
```
6. Run `sudo npm install -g nodemon` in the terminal.
7. Run `npm run dev` in the terminal.
8. The application should now be running on `http://localhost:3000`

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
