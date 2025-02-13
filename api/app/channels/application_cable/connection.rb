require_relative '../../services/auth_token_services/validate'

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      # self.current_user = find_verified_user
      puts "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT"
      reject_unauthorized_connection
    end

    private

    def find_verified_user
      token = request.params[:token]
      user = AuthTokenServices::Validate.new(token).call

      return user if user

      reject_unauthorized_connection
    end
  end
end
