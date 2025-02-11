module Auth
  class JsonWebToken
    SECRET_KEY = Rails.application.secrets.secret_key_base.to_s

    def self.expires_in
      24.hours.from_now.to_i
    end

    def self.encode(payload, exp = 24.hours.from_now)
      payload[:exp] = exp.to_i
      JWT.encode(payload, SECRET_KEY)
    end

    def self.decode(token)
      decoded = JWT.decode(token, SECRET_KEY)[0]
      HashWithIndifferentAccess.new(decoded)
    rescue JWT::DecodeError
      nil
    end
  end
end
