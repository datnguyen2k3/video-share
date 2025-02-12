require_relative 'concern/helper'

module AuthTokenServices
  class Create
    include Concern::Helper
    attr_reader :user_id, :data

    def initialize(user_id)
      @user_id = user_id
      @data = {}
    end

    def call
      expires_in = 24.hours.from_now.to_i
      payload = {
        user_id: user_id,
        exp: expires_in,
      }

      access_token = JWT.encode(payload, SECRET_KEY)

      @data = {
        access_token: access_token,
        expires_in: expires_in
      }
    end
  end
end
