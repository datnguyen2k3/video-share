class ExpiredTokenError < ApiError
  def initialize(details = {})
    super(:unauthorized, "Token has expired", details)
  end
end
