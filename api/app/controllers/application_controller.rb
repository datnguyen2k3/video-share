class ApplicationController < ActionController::Base
  before_action :authorize_request

  private

  def authorize_request
    header = request.headers['Authorization']
    header = header.split(' ').last if header
    decoded = Auth::JsonWebToken.decode(header)
    @current_user = User.find(decoded[:user_id]) if decoded
  end
end
