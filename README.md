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

### Backend
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
- Create database
```bash
  rails db:create
  rails db:migrate
```
- Start the server
```bash
  rails s
```

- If command `rails` is not working, try add `bundle exec` before the command, e.g. `bundle exec rails s`