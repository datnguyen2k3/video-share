require 'rails_helper'

RSpec.describe VideoController, type: :controller do
  let(:user) { double("User", id: 1) }
  let(:video) { double("Video", id: 1,
                       owner_id: user.id,
                       url: "https://example.com/video.mp4") }
  let(:video_response) { { id: video.id,
                           owner_id: video.owner_id,
                           url: video.url } }
  let(:cursor) { "some-cursor" }
  let(:videos) { [video] }
  let(:next_cursor) { "next-cursor" }

  before do
    allow(controller).to receive(:current_user).and_return(user)
    allow(controller).to receive(:authorize_request).and_return(true)
    allow(VideoSerializer).to receive(:new).with(video).and_return(double(serializable_hash: video_response))
  end

  describe "POST #create" do
    let(:valid_params) { { url: "https://example.com/video.mp4" } }
    let(:expected_service_params) { { owner_id: user.id, url: valid_params[:url] } }

    context "when video creation is successful" do
      before do
        allow(::VideoServices::Create)
          .to receive(:new)
                .with(expected_service_params, user)
                .and_return(double(call: video))
      end

      it "returns video data" do
        post :create, params: valid_params
        expect(response).to have_http_status(:created)

        json_response = JSON.parse(response.body)
        expect(json_response["video"]["id"]).to eq(video.id)
        expect(json_response["video"]["url"]).to eq(video.url)
      end
    end
  end

  describe "GET #get" do
    context "when videos are fetched successfully" do
      before do
        allow(::VideoServices::GetByCursor)
          .to receive(:new)
                .with(cursor)
                .and_return(double(call: { videos: videos, next_cursor: next_cursor }))
      end

      it "returns list of videos and next cursor" do
        get :get, params: { cursor: cursor }
        expect(response).to have_http_status(:ok)

        json_response = JSON.parse(response.body)
        expect(json_response["videos"].size).to eq(1)
        expect(json_response["videos"].first["id"]).to eq(video.id)
        expect(json_response["next_cursor"]).to eq(next_cursor)
      end
    end
  end
end
