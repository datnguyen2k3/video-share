module Exceptions
  class InvalidPasswordError < ApiError
    def initialize(details = {})
      super(:bad_request, "Invalid password", details)
    end
  end
end