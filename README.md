# Video share

- This is a simple Youtube video sharing app built with Ruby on Rails and React.
- Functions:
  - User can sign up and log in.
  - User can share a Youtube video by pasting the video URL.
  - User can view the video shared by other users.

# Installation

- Clone the repository
```bash
  git clone
  cd video-share
```

## With Docker

## Without Docker

- Install Redis

### Backend
- Go to backend folder
```bash
  cd api
```
- Install ruby 3.2.2, depends on your OS:
    - [Install Ruby on Ubuntu](https://linuxize.com/post/how-to-install-ruby-on-ubuntu-20-04/)
    - [Install Ruby on Windows](https://rubyinstaller.org/)
    - [Install Ruby on MacOS](https://stackify.com/install-ruby-on-your-mac-everything-you-need-to-get-going/)
- Check if Ruby is installed, it should return version 3.2.2
```bash
  ruby -v
```
- Install bundler
```bash
  gem install bundler
```
- Install dependencies
```bash
  bundle install
```
- For macos specific user, do these additional steps:
For macOS using Homebrew:
```bash
  brew install libpq
  bundle config --local build.pg --with-opt-dir="$(brew --prefix libpq)"
```

- Create database
```bash
  bundle exec rails db:create
  bundle exec rails db:migrate
```
- Replace variable in file .env

- Start the API server
```bash
  bundle exec rails s
```

- Start the sidekiq worker (background jobs)
```bash
  bundle exec sidekiq
```

- Start anycable RPC server (server interact with websocket server)
```bash
  bundle exec anycable
```

- Start the websocket server
- Replace anycable-go-linx with anycable-go depending on your OS by download in here: https://github.com/anycable/anycable-go/releases/tag/v1.5.6
```bash
  ./anycable-go-linx
```

- If commands are not working, try to add sudo if you get permission denied of these commands
