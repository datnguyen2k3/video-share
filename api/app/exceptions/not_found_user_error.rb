class NotFoundUserError < ApiError
  def initialize(details = {})
    super(404, "User not found", details)
  end
end
