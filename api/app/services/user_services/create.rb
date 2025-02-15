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
      validate_name
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
      length_from_8_to_50_chars_regex = /.{8,50}/
      have_one_upper_case_regex = /[A-Z]/
      have_one_lower_case_regex = /[a-z]/
      have_one_digit_regex = /\d/
      have_one_special_char_regex = /[!@#$%^&*]/

      is_valid = [
        length_from_8_to_50_chars_regex,
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

    def validate_name
      name = params[:name]

      if name.nil? || name.strip.empty? || name.strip.length < 4 || name.strip.length > 100
        raise InvalidUserNameError
      end

      if name =~ /[^a-zA-Z\s]/
        raise InvalidUserNameError
      end
    end
  end
end
