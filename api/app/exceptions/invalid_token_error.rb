class InvalidTokenError < ApiError
  def initialize(details = {})
    super(402, "Invalid token", details)
  end
end
