class ExistedVideoError < ApiError
  def initialize(details = {})
    super(400, "Video already exists", details)
  end
end
