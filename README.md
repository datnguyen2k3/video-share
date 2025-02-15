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

## Without Docker

### Frontend
- Go to frontend folder
```bash
  cd frontend
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
  + Follow instruction in here: https://rubyinstaller.org/

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

# Troubleshooting
- If those commands are not working, try to add `sudo` if you get permission denied of these commands