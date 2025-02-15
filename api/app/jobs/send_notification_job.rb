class SendNotificationJob
  include Sidekiq::Job

  sidekiq_options retry: 3

  def perform(video_id)
    video = Video.find_by(id: video_id)

    return if video.nil?

    ActionCable.server.broadcast 'notifications', VideoSerializer.new(video).as_json
  end
end
