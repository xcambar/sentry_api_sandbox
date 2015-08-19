# Absolutely not generic Sentry API client

This repo will slowly evolve with my needs to dig through the data
Sentry provides with their API.

If you want to play with it, feel free,
but it comes with the only guarantee to work for me and my needs.

You've been warned... have fun.

# Install

```sh
npm install
```

# Configuration

Configuration (API key, etc...) relies on environment variables.

You can `cp .env.sample .env` and edit the `.env` file so
you don't have to type them all at every run.

# Run

The repo comes with simple scripts that query and manipulate 
Sentry's API.

You can list them (if you can't do `ls`) by running

```sh
# shows the available scripts
node index.js
```

Otherwise, just run the node script as you would do with any other Node script:

```sh
node xyz.js
```

# Tests

Nope.

Will add if the project is used by someone else.

# Documentation

Nope.

Will add if the project is used by someone else.

# License

MIT
