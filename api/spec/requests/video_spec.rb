require 'rails_helper'
require_relative '../../app/services/auth_token_services/create'

RSpec.describe "Video API", type: :request do
  let!(:user) { create(:user, name: "John Doe",
                              email: "john@example.com",
                              password: "password123") }

  let!(:auth_token) { AuthTokenServices::Create.new(user.id).call[:access_token] }
  let!(:headers) { { "Authorization" => "Bearer #{auth_token}" } }

  describe "POST /video" do
    let(:url) { "https://www.youtube.com/watch?v=EewnoXvCzgE" }
    let(:video_params) { { url: url } }

    context "when video creation is successful" do
      it "creates a new video and returns video data" do
        post "/video", params: video_params, headers: headers

        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)

        expect(json_response["video"]["id"]).to be_present
        expect(json_response["video"]["youtube_id"]).to eq("EewnoXvCzgE")
      end
    end

    context "when authorization is missing" do
      it "returns unauthorized error" do
        post "/video", params: video_params

        expect(response).to have_http_status(:unauthorized)
        json_response = JSON.parse(response.body)

        expect(json_response["error"]).to eq("Invalid token")
      end
    end

    context "when url is invalid" do
      let(:url) { "invalid_url" }

      it "returns bad request error" do
        post "/video", params: video_params, headers: headers

        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)

        expect(json_response["error"]).to eq("Invalid video URL")
      end
    end
  end

  describe "GET /video" do
    let!(:videos) do
      3.times.map do |i|
        create(:video, owner_id: user.id, youtube_id: "EewnoXvCzgE" + i.to_s)
      end
    end

    context "when cursor is nil" do
      it "returns a list of videos" do
        get "/video", headers: headers

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response["videos"].size).to eq(3)
        expect(json_response["videos"].first["youtube_id"]).to eq(videos.third.youtube_id)
      end
    end

    context "when cursor is too small" do
      let(:params) { { cursor: 0 } }

      it "returns 2 videos" do
        get "/video", params: params, headers: headers

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response["videos"].size).to eq(0)
      end
    end
  end
end
