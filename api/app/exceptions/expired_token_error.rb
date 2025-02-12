class ExpiredTokenError < ApiError
  def initialize(details = {})
    super(401, "Token has expired", details)
  end
end
