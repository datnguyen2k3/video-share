class AuthController < ApplicationController
  skip_before_action :verify_authenticity_token

  def register
    render json: {
      user: UserSerializer.new(user).serializable_hash,
      auth: token_response,
    }, status: :created
  end

  def login
    user = User.find_by(email: params[:email])
    if user&.authenticate(params[:password])
      token = Auth::JsonWebToken.encode({ user_id: user.id })
      render json: { auth: token_response(token) }, status: :ok
    end
  end

  private

  def user_params
    params.permit(:name, :email, :password)
  end

  def user
    @user ||= Services::User::Create.new(user_params).call
  end

  def token_response
    Services::AuthToken::Create.new(user.id).call
  end
end
