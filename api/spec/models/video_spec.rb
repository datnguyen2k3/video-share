require 'rails_helper'

describe Video, type: :model do
  let(:user) { User.create!(email: "test@example.com",
                            name: "Test User",
                            password: "password") }

  it "is valid with valid attributes" do
    video = Video.new(youtube_id: "abc123", owner: user)
    expect(video).to be_valid
  end

  it "is invalid without a youtube_id" do
    video = Video.new(owner: user)
    expect(video).not_to be_valid
    expect(video.errors[:youtube_id]).to include("can't be blank")
  end

  it "is invalid without an owner_id" do
    video = Video.new(youtube_id: "abc123")
    expect(video).not_to be_valid
    expect(video.errors[:owner_id]).to include("can't be blank")
  end
end
