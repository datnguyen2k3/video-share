require 'rails_helper'
require_relative '../../../app/services/video_services/create'

RSpec.describe VideoServices::Create, type: :service do
  let(:owner) { create(:user) }
  let(:valid_url) { "https://www.youtube.com/watch?v=abc123XYZ" }
  let(:invalid_url) { "https://www.invalid.com/watch?v=abc123XYZ" }
  let(:video_param) { { url: valid_url, owner_id: owner.id } }

  before do
    allow(SendNotificationJob).to receive(:perform_async)
  end

  context "when creating a video with a valid YouTube URL" do
    it "creates a new video" do
      service = described_class.new(video_param, owner)
      video = service.call

      expect(video).to be_persisted
      expect(video.youtube_id).to eq("abc123XYZ")
      expect(SendNotificationJob).to have_received(:perform_async).with(video.id)
    end
  end

  context "when URL is invalid" do
    it "raises InvalidVideoUrl error" do
      service = described_class.new({ url: invalid_url, owner_id: owner.id }, owner)
      expect { service.call }.to raise_error(InvalidVideoUrl)
    end
  end

  context "when video already exists" do
    it "raises ExistedVideoError" do
      create(:video, youtube_id: "abc123XYZ")

      service = described_class.new(video_param, owner)
      expect { service.call }.to raise_error(ExistedVideoError)
    end
  end

  context "when extracting YouTube ID" do
    it "parses the correct video ID" do
      service = described_class.new(video_param, owner)
      expect(service.youtube_id).to eq("abc123XYZ")
    end
  end
end
