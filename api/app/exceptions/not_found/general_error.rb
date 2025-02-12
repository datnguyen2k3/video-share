module Exceptions
  module NotFound
    class GeneralError < ApiError
      def initialize(error = "Not found", details = {})
        super(:not_found, error, details)
      end
    end
  end
end
