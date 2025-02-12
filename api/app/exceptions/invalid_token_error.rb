class InvalidTokenError < ApiError
  def initialize(details = {})
    super(401, "Invalid token", details)
  end
end
