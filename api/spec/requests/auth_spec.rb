require 'rails_helper'

RSpec.describe "Auth API", type: :request do
  describe "POST /auth/user" do
    context "when registration is successful" do
      let(:valid_user_params) { { name: "John Doe",
                                  email: "john@example.com",
                                  password: "Password@123" } }

      it "creates a new user and returns an auth token" do
        post "/auth/user", params: valid_user_params

        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)

        expect(json_response["user"]["id"]).to be_present
        expect(json_response["user"]["email"]).to eq(valid_user_params[:email])
        expect(json_response["auth"]).to be_present
      end
    end

    context "when registration fails" do
      let(:invalid_user_params) { { email: "invalid_email" } }

      it "returns an error" do
        post "/auth/user", params: invalid_user_params

        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)

        expect(json_response["error"]).to eq("Invalid email")
      end
    end
  end

  describe "POST /auth/token" do
    let!(:user) { create(:user, name: "John Doe",
                                email: "john@example.com",
                                password: "Password@123") }

    context "when login is successful" do
      let(:login_params) { { email: user.email, password: "Password@123" } }

      it "returns an auth token" do
        post "/auth/token", params: login_params

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        puts json_response

        expect(json_response["auth"]).to be_present
        expect(json_response["auth"]["access_token"]).to be_present
        expect(json_response["auth"]["expires_in"]).to be_present
      end
    end

    context "when login fails" do
      let(:invalid_login_params) { { email: user.email, password: "wrongpassword" } }

      it "returns an error" do
        post "/auth/token", params: invalid_login_params

        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)

        expect(json_response["error"]).to eq("Invalid password")
      end
    end
  end
end
