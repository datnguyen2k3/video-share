require_relative '../auth_token_services/create'

module UserServices
  class Login
    attr_reader :params, :user

    def initialize(params)
      @params = params
      @user = nil
    end

    def call
      validate_existed_user
      validate_match_password

      ::AuthTokenServices::Create.new(user.id).call
    end

    def validate_existed_user
      existed_user = ::User.find_by(email: params[:email])
      raise NotFoundUserError unless existed_user

      @user = existed_user
    end

    def validate_match_password
      unless user&.authenticate(params[:password])
        raise InvalidPasswordError
      end
    end
  end
end
