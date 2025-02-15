require 'rails_helper'

RSpec.describe AuthController, type: :controller do
  let(:user) { instance_double("User",
                               id: 1,
                               name: "John Doe",
                               email: "john@example.com") }
  let(:user_response) { { id: user.id,
                          name: user.name,
                          email: user.email,
                          created_at: Time.now,
                          updated_at: Time.now } }
  let(:token) { "valid.jwt.token" }

  before do
    allow(UserSerializer)
      .to receive(:new)
            .with(user)
            .and_return(instance_double(UserSerializer,
                                        serializable_hash: user_response))
  end

  describe "POST #register" do
    let(:valid_params) { { name: "John Doe",
                           email: "john@example.com",
                           password: "password123" } }

    context "when registration is successful" do
      before do
        allow(::UserServices::Create)
          .to receive(:new)
                .with(ActionController::Parameters.new(valid_params).permit!)
                .and_return(instance_double(::UserServices::Create, call: user))
        allow(::AuthTokenServices::Create)
          .to receive(:new)
                .with(user.id)
                .and_return(instance_double(::AuthTokenServices::Create, call: token))
      end

      it "returns user data and auth token" do
        post :register, params: valid_params
        expect(response).to have_http_status(:created)

        json_response = JSON.parse(response.body)
        expect(json_response["user"]["id"]).to eq(user.id)
        expect(json_response["auth"]).to eq(token)
      end
    end
  end

  describe "POST #login" do
    let(:valid_login_params) { { email: "john@example.com",
                                 password: "password123" } }

    context "when login is successful" do
      before do
        allow(::UserServices::Login)
          .to receive(:new)
                .with(ActionController::Parameters.new(valid_login_params).permit!)
                .and_return(instance_double(::UserServices::Login, call: token))
      end

      it "returns auth token" do
        post :login, params: valid_login_params
        expect(response).to have_http_status(:ok)

        json_response = JSON.parse(response.body)
        expect(json_response["auth"]).to eq(token)
      end
    end
  end
end
