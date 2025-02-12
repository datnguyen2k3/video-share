module Services
  module User
    class Create
      attr_reader :params, :user

      def initialize(params)
        @params = params
        @data = nil
      end

      def call
        validate_email
        validate_password
        validate_existed_user

        @user = ::User.new(params)
        user.save!
      end

      def validate_email
        regex = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
        is_valid = !!(params[:email] =~ regex)

        unless is_valid
          raise Exceptions::InvalidEmailError
        end
      end

      def validate_password
        password = params[:password]
        at_least_8_chars = /.{8,}/
        have_one_upper_case = /[A-Z]/
        have_one_lower_case = /[a-z]/
        have_one_digit = /\d/
        have_one_special_char = /[!@#$%^&*]/

        is_valid = [
          at_least_8_chars,
          have_one_upper_case,
          have_one_lower_case,
          have_one_digit,
          have_one_special_char
        ].all? { |r| password =~ r }

        unless is_valid
          raise Exceptions::InvalidPasswordError
        end
      end

      def validate_existed_user
        existed_user = User.find_by(email: params[:email])
        if existed_user
          raise Exceptions::ExistedUserError
        end
      end
    end
  end
end