require 'rails_helper'

RSpec.describe ApplicationController, type: :controller do
  controller do
    def index
      render json: { message: "Authorized" }
    end
  end

  let(:user) { create(:user) }
  let(:valid_token) { "valid.jwt.token" }

  before do
    allow(::AuthTokenServices::Validate)
      .to receive(:new).with(valid_token)
                       .and_return(double(call: user))

    allow(::AuthTokenServices::Validate)
      .to receive(:new).with(nil)
                       .and_raise(InvalidTokenError)
  end

  context "when authorization header is present" do
    before { request.headers["Authorization"] = "Bearer #{valid_token}" }

    it "sets @current_user" do
      get :index
      expect(assigns(:current_user)).to eq(user)
    end

    it "returns a success response" do
      get :index
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq({ "message" => "Authorized" })
    end
  end

  context "when authorization header is missing" do
    before { request.headers["Authorization"] = nil }

    it "sets @current_user to nil" do
      expect { get :index }.to raise_error(InvalidTokenError, "Invalid token")
    end
  end
end
