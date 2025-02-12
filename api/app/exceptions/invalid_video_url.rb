class InvalidVideoUrl < ApiError
  def initialize(details = {})
    super(400, "Invalid video URL", details)
  end
end
