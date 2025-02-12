module Services
  module User
    class Login
      attr_reader :params, :user

      def initialize(params)
        @params = params
        @user = nil
      end

      def call
        validate_existed_user
        validate_match_password

        Service::AuthToken::Create.new(user.id).call
      end

      def validate_existed_user
        existed_user = ::User.find_by(email: params[:email])
        if existed_user.nil?
          raise Exceptions::NotFound::UserError
        end

        @user = existed_user
      end

      def validate_match_password
        unless user&.authenticate(params[:password])
          raise Exceptions::InvalidPasswordError.new
        end
      end

    end
end