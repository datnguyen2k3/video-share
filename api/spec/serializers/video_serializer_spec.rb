require 'rails_helper'

RSpec.describe VideoSerializer, type: :serializer do
  let!(:video) { create(:video) }
  let!(:serialization) { VideoSerializer.new(video).as_json }

  describe 'serialization' do
    it "includes the expected attributes" do
      expected_keys = [:id, :youtube_id, :owner_id, :owner_name, :owner_email, :created_at, :updated_at]
      expect(serialization.keys).to match_array(expected_keys)
    end

    it "serializes the correct values" do
      expect(serialization[:id]).to eq(video.id)
      expect(serialization[:youtube_id]).to eq(video.youtube_id)
      expect(serialization[:owner_id]).to eq(video.owner.id)
      expect(serialization[:owner_name]).to eq(video.owner.name)
      expect(serialization[:owner_email]).to eq(video.owner.email)
      expect(serialization[:created_at]).to eq(video.created_at.iso8601)
      expect(serialization[:updated_at]).to eq(video.updated_at.iso8601)
    end
  end
end
