module AuthTokenServices
  module Concern
    module Helper
      SECRET_KEY = Rails.application.secrets.secret_key_base.to_s
    end
  end
end
