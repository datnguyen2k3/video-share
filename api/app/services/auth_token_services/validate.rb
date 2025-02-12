module AuthTokenServices
  class Validate
    include Concern::Helper

    attr_reader :token

    def initialize(token)
      @token = token
    end

    def call
      payload = JWT.decode(token, SECRET_KEY)[0]
      user_id = payload[:user_id]

      user = ::User.find(user_id)
      unless user
        raise Exceptions::InvalidTokenError
      end

      user
    rescue JWT::ExpiredSignature => e
      raise Exceptions::ExpiredTokenError
    rescue JWT::DecodeError => e
      raise Exceptions::InvalidTokenError
    end
  end
end
