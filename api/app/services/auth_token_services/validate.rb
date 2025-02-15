module AuthTokenServices
  class Validate

    attr_reader :token

    def initialize(token)
      @token = token
    end

    def call
      payload = JWT.decode(token, ENV['SECRET_KEY'])[0]
      user_id = payload['user_id']

      user = ::User.find_by(id: user_id)
      unless user
        raise InvalidTokenError
      end

      user
    rescue JWT::ExpiredSignature => e
      raise ExpiredTokenError
    rescue JWT::DecodeError => e
      raise InvalidTokenError
    end
  end
end
