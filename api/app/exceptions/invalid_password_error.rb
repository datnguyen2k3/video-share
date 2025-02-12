class InvalidPasswordError < ApiError
  def initialize(details = {})
    super(400, "Invalid password", details)
  end
end
