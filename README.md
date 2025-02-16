# Introduction

- Video Share a simple Youtube video sharing app built with Ruby on Rails and React.
- Functions:
  - User can sign up and log in.
  - User can share a Youtube video by pasting the video URL.
  - User can view the video shared by other users.
  - User can receive notifications real-time when others share a video

# Prerequisites

- Frontend: Node v22
- Backend: Ruby v3.2.2
- Database: Redis v7, Postgres v17

# Installation

- Clone the repository

```bash
  git clone https://github.com/datnguyen2k3/video-share.git
  cd video-share
```

## With Docker

- You need to install docker first
- Then run

```bash
  docker-compose up
```

## Without Docker

### Frontend

#### Install NVM & NPM

- For Mac

```bash
brew install nvm
mkdir ~/.nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/opt/nvm/etc/bash_completion" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion"' >> ~/.zshrc
source ~/.zshrc
nvm install --lts
nvm use --lts
```

- For Linux

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
source ~/.bashrc
nvm install --lts
nvm use --lts
```

- For Windows
  - Follow instructions here: nvm-windows (https://github.com/coreybutler/nvm-windows)

#### How to run

- Go to frontend folder

```bash
  cd frontend
```

- Run the app

```bash
  npm run dev
  # or
  yarn dev
  # or
  pnpm dev
  # or
  bun dev
```

- Open [http://localhost:3001](http://localhost:3000) with your browser to see the result.
- Run test:

```bash
    npm run test
```

### Backend

- Go to backend folder

```bash
  cd api
```

#### Install Postgres

Make sure you install postgres url `localhost:5432` with username and password is `postgres`

- For Mac

```bash
  brew install postgresql
  brew services start postgresql
  psql postgres
  ALTER USER postgres WITH PASSWORD 'postgres';
  \q
```

- For Linux

```bash
  sudo apt update
  sudo apt install postgresql postgresql-contrib -y
  sudo -i -u postgres psql
  ALTER USER postgres WITH PASSWORD 'postgres';
  \q
```

#### Install Redis

You should install redis with url `redis://localhost:6379`

- Ubuntu/Debian

```bash
  sudo apt update
  sudo apt install redis-server -y
  sudo systemctl start redis
```

- MacOS with Homebrew

```bash
  brew install redis
  brew services start redis
```

- Window with WSL

```bash
  wsl --install
  wsl
  sudo apt update && sudo apt install redis-server -y
```

#### Install Ruby 3.2.2

- For Mac

```bash
  brew install rbenv ruby-build
  echo 'eval "$(rbenv init -)"' >> ~/.zshrc
  source ~/.zshrc
  rbenv install 3.2.2
  brew install openssl readline libyaml gmp
  rbenv global 3.2.2
```

- For Linux

```bash
  sudo apt update
  sudo apt install -y git curl build-essential libssl-dev libreadline-dev zlib1g-dev
  git clone https://github.com/rbenv/rbenv.git ~/.rbenv
  echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
  echo 'eval "$(rbenv init - bash)"' >> ~/.bashrc
  source ~/.bashrc
  git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
  echo 'export PATH="$HOME/.rbenv/plugins/ruby-build/bin:$PATH"' >> ~/.bashrc
  source ~/.bashrc
  rbenv install 3.2.2
  rbenv global 3.2.2
```

- For window
  - Follow instruction in here: https://rubyinstaller.org/

Check if Ruby is installed, it should return version 3.2.2

```bash
  ruby -v
```

#### Install dependencies

- Install bundler

```bash
  gem install bundler
```

- Install dependencies

```bash
  bundle install
```

- If you using mac and have error with `pg` when `bundle install`, try to

```bash
  brew install libpq
  bundle config --local build.pg --with-opt-dir="$(brew --prefix libpq)"
```

- Create database

```bash
  bundle exec rails db:create
  bundle exec rails db:migrate
```

#### Start the API server

```bash
  bundle exec rails s
```

#### Start the sidekiq worker (background jobs)

```bash
  bundle exec sidekiq
```

#### Start anycable RPC server (server interact with websocket server)

```bash
  bundle exec anycable
```

#### Start the websocket server

- For window

```bash
  ./anycable-go-win.exe
```

- For linux

```bash
  ./anycable-go-linux
```

- For mac

```bash
  brew install anycable-go
  anycable-go
```

#### Running test

- Setup test database

```bash
  bundle exec rails db:create RAILS_ENV=test
  bundle exec rails db:migrate RAILS_ENV=test
```

- Run test

```bash
  bundle exec rspec
```

# Usage

- After installation, go to `localhost:3001` to explore the app
- For register page:
  + Name should have at least 4 characters and only is alphabet
  + Email should be valid email
  + Password need at least 8 characters, and have at least a:
    + special characters
    + lowercase 
    + uppercase 
    + number
- For login page:
  + Email need to be exists
  + Password need to be match
- For homepage:
  + Videos will show by the newest first
  + Scroll down to see more videos
- For share video page:
  + The url must be following pattern: `https://www.youtube.com/watch?v=<YOUTUBE_ID>`
  + The url is not shared by anyone before

# Troubleshooting

- If those commands are not working, try to add `sudo` if you get permission denied of these commands
