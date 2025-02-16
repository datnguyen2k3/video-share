require 'rails_helper'
require_relative '../../../app/services/video_services/create'

RSpec.describe VideoServices::Create, type: :service do
  let(:owner) { create(:user) }
  let(:url) { "https://www.youtube.com/watch?v=MVUT12QM8nc" }
  let(:video_param) { { url: url, owner_id: owner.id } }

  before do
    allow(SendNotificationJob).to receive(:perform_async)
  end

  context "when creating a video with a valid YouTube URL" do
    it "creates a new video" do
      service = described_class.new(video_param, owner)
      video = service.call

      expect(video).to be_persisted
      expect(video.youtube_id).to eq("MVUT12QM8nc")
      expect(SendNotificationJob).to have_received(:perform_async).with(video.id)
    end
  end

  context "when URL is invalid" do
    let(:url) { "https://www.invalid.com/watch?v=abc123XYZ" }

    it "raises InvalidVideoUrl error" do
      service = described_class.new(video_param, owner)
      expect { service.call }.to raise_error(InvalidVideoUrl)
    end
  end

  context "when video already exists" do
    before do
      create(:video, owner: owner, youtube_id: "MVUT12QM8nc")
    end

    it "raises ExistedVideoError" do
      service = described_class.new(video_param, owner)
      expect { service.call }.to raise_error(ExistedVideoError)
    end
  end

  context "when video url does not exist" do
    let(:url) { "https://www.youtube.com/watch?v=abc123XYZ" }

    it "raises InvalidYoutubeUrl" do
      service = described_class.new(video_param, owner)
      expect { service.call }.to raise_error(InvalidVideoUrl)
    end
  end
end
