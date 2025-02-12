require_relative '../services/auth_token_services/create'
require_relative '../services/user_services/create'
require_relative '../services/user_services/login'

class AuthController < ApplicationController
  skip_before_action :verify_authenticity_token, :authorize_request

  def register
    user = ::UserServices::Create.new(create_user_params).call
    token = ::AuthTokenServices::Create.new(user.id).call
    user_response = UserSerializer.new(user).serializable_hash

    render json: {
      user: user_response,
      auth: token,
    }, status: :created
  end

  def login
    token = ::UserServices::Login.new(login_params).call
    render json: { auth: token }, status: :ok
  end

  private

  def create_user_params
    params.permit(:name, :email, :password)
  end

  def login_params
    params.permit(:email, :password)
  end
end
