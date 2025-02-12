module Exceptions
  class ApiError < StandardError
    attr_reader :status, :error, :details

    def initialize(status = :bad_request, error = "Bad request", details = {})
      super(error)
      @status = status
      @error = error
      @details = details
    end

    def response_body
      { error: error }.merge(details)
    end
  end
end