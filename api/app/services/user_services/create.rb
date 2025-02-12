module UserServices
  class Create
    attr_reader :params, :user

    def initialize(params)
      @params = params
      @data = nil
    end

    def call
      validate_email
      validate_password
      validate_not_existed_user

      user = ::User.new(params)
      user.save!
      user
    end

    def validate_email
      regex = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
      is_valid = !!(params[:email] =~ regex)

      unless is_valid
        raise InvalidEmailError
      end
    end

    def validate_password
      password = params[:password]
      at_least_8_chars_regex = /.{8,}/
      have_one_upper_case_regex = /[A-Z]/
      have_one_lower_case_regex = /[a-z]/
      have_one_digit_regex = /\d/
      have_one_special_char_regex = /[!@#$%^&*]/

      is_valid = [
        at_least_8_chars_regex,
        have_one_upper_case_regex,
        have_one_lower_case_regex,
        have_one_digit_regex,
        have_one_special_char_regex
      ].all? { |regex| password =~ regex }

      unless is_valid
        raise InvalidPasswordError
      end
    end

    def validate_not_existed_user
      existed_user = User.find_by(email: params[:email])
      if existed_user
        raise ExistedUserError
      end
    end
  end
end
