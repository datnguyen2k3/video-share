module Service
  module AuthToken
    class Create
      attr_reader :user_id, :data

      def initialize(user_id)
        @user_id = user_id
        @data = {}
      end

      def self.call
        expires_in = 24.hours.from_now.to_i
        payload = {
          user_id: user_id,
        }
        @data = {
          access_token: Auth::JsonWebToken.encode(payload, expires_in),
          expires_in: expires_in
        }
      end
    end
  end
end
