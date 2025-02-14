class SendNotificationJob
  include Sidekiq::Job

  def perform(video_id, owner_id, youtube_id)
    ActionCable.server.broadcast 'notifications_channel', video_id
  end
end
