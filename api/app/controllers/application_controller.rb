require_relative '../services/auth_token_services/validate'

class ApplicationController < ActionController::Base
  before_action :authorize_request

  attr_reader :current_user

  private

  def authorize_request
    header = request.headers['Authorization']
    header = header.split(' ').last if header
    @current_user = ::AuthTokenServices::Validate.new(header).call
  end
end
