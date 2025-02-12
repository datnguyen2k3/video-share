module NotFound
  class GeneralError < ApiError
    def initialize(error = "Not found", details = {})
      super(404, error, details)
    end
  end
end
