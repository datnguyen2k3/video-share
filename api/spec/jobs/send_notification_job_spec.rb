require 'rails_helper'

RSpec.describe SendNotificationJob, type: :job do
  let(:video) { create(:video) }

  before do
    allow(ActionCable.server).to receive(:broadcast)
  end

  it "queues the job" do
    expect {
      SendNotificationJob.perform_async(video.id)
    }.to change(SendNotificationJob.jobs, :size).by(1)
  end

  it "executes perform and broadcasts notification" do
    SendNotificationJob.new.perform(video.id)

    expect(ActionCable.server).to have_received(:broadcast).with(
      'notifications',
      VideoSerializer.new(video).as_json
    )
  end

  it "does nothing if video is not found" do
    expect {
      SendNotificationJob.new.perform(-1)
    }.not_to raise_error
  end
end
