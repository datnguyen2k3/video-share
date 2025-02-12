module Exceptions
  class ExistedUserError < ApiError
    def initialize(details = {})
      super(:bad_request, "User already exists", details)
    end
  end
end