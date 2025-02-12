class InvalidEmailError < ApiError
  def initialize(details = {})
    super(400, "Invalid email", details)
  end
end
