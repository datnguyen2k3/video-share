module Exceptions

  class InvalidEmailError < ApiError
    def initialize(details = {})
      super(:bad_request, "Invalid email", details)
    end
  end
end