class InvalidUserNameError < ApiError
  def initialize(details = {})
    super(400, "Invalid user name", details)
  end
end