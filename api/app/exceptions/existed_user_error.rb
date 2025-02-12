class ExistedUserError < ApiError
  def initialize(details = {})
    super(400, "User already exists", details)
  end
end
